import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../users/entities/usuario.entity';
import { Rol } from '../users/entities/rol.entity';
import { PerfilSismologo } from '../users/entities/perfil-sismologo.entity';
import { SesionUsuario } from '../users/entities/sesion-usuario.entity';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RoleName } from '../../common/constants/roles.constant';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    @InjectRepository(PerfilSismologo)
    private readonly perfilSismologoRepo: Repository<PerfilSismologo>,
    @InjectRepository(SesionUsuario)
    private readonly sesionRepo: Repository<SesionUsuario>,
  ) {}

  async listUsers(search?: string, roleFilter?: string) {
    const qb = this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'r')
      .leftJoinAndSelect('u.perfilSismologo', 'ps')
      .orderBy('u.fechaRegistro', 'DESC');

    if (search) {
      qb.andWhere(
        '(LOWER(u.nombre) LIKE :s OR LOWER(u.apellidos) LIKE :s OR LOWER(u.correo) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }

    if (roleFilter) {
      qb.andWhere('r.nombre = :roleFilter', { roleFilter });
    }

    const users = await qb.getMany();

    return users.map((u) => ({
      idUsuario: u.idUsuario,
      nombre: u.nombre,
      apellidos: u.apellidos,
      correo: u.correo,
      telefono: u.telefono,
      estado: u.estado,
      fechaRegistro: u.fechaRegistro,
      roles: u.roles.map((r) => r.nombre),
      perfilSismologo: u.perfilSismologo
        ? {
            numeroAcreditacion: u.perfilSismologo.numeroAcreditacion,
            institucionAcreditadora: u.perfilSismologo.institucionAcreditadora,
            vigente: u.perfilSismologo.vigente,
          }
        : null,
    }));
  }

  async getUserById(idUsuario: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario },
      relations: ['roles', 'perfilSismologo', 'suscripciones', 'suscripciones.macrodistrito'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async updateUserStatus(idUsuario: number, dto: UpdateUserStatusDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.estado = dto.estado;
    usuario.fechaActualizacion = new Date();
    await this.usuarioRepo.save(usuario);

    // Si se suspende la cuenta, revocar todas sus sesiones activas (RF5.03 / HU17)
    if (!dto.estado) {
      await this.sesionRepo.update({ idUsuario }, { revocada: true });
    }

    return {
      mensaje: dto.estado ? 'Cuenta de usuario activada' : 'Cuenta de usuario suspendida y sesiones revocadas',
      estado: usuario.estado,
    };
  }

  async assignRole(idUsuario: number, dto: AssignRoleDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario },
      relations: ['roles', 'perfilSismologo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const rol = await this.rolRepo.findOne({ where: { idRol: dto.idRol } });
    if (!rol) {
      throw new NotFoundException('El rol especificado no existe');
    }

    // Regla RF5.03: Si se asigna el rol Sismólogo, es obligatorio registrar la acreditación profesional
    if (rol.nombre === RoleName.SISMOLOGO) {
      if (!dto.numeroAcreditacion) {
        throw new BadRequestException(
          'Para asignar el rol Sismólogo es obligatorio ingresar el número de acreditación o matrícula profesional',
        );
      }

      let perfil = await this.perfilSismologoRepo.findOne({ where: { idUsuario } });
      if (!perfil) {
        perfil = this.perfilSismologoRepo.create({
          idUsuario,
          numeroAcreditacion: dto.numeroAcreditacion,
          institucionAcreditadora: dto.institucionAcreditadora || 'Observatorio San Calixto',
          fechaVerificacion: new Date().toISOString().split('T')[0],
          vigente: true,
        });
      } else {
        perfil.numeroAcreditacion = dto.numeroAcreditacion;
        perfil.institucionAcreditadora = dto.institucionAcreditadora || perfil.institucionAcreditadora;
        perfil.vigente = true;
      }
      await this.perfilSismologoRepo.save(perfil);
      usuario.perfilSismologo = perfil;
    }

    // Agregar rol si no lo tiene
    const alreadyHasRole = usuario.roles.some((r) => r.idRol === rol.idRol);
    if (!alreadyHasRole) {
      usuario.roles.push(rol);
      await this.usuarioRepo.save(usuario);
    }

    return {
      mensaje: `Rol ${rol.nombre} asignado exitosamente al usuario`,
      roles: usuario.roles.map((r) => r.nombre),
    };
  }

  async getAllRoles() {
    return this.rolRepo.find();
  }
}
