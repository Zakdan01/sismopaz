import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async getProfile(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario },
      relations: ['roles', 'perfilSismologo', 'suscripciones', 'suscripciones.macrodistrito'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      telefono: usuario.telefono,
      estado: usuario.estado,
      fechaRegistro: usuario.fechaRegistro,
      fechaActualizacion: usuario.fechaActualizacion,
      roles: usuario.roles.map((r) => r.nombre),
      perfilSismologo: usuario.perfilSismologo
        ? {
            numeroAcreditacion: usuario.perfilSismologo.numeroAcreditacion,
            institucionAcreditadora: usuario.perfilSismologo.institucionAcreditadora,
            vigente: usuario.perfilSismologo.vigente,
          }
        : null,
      suscripciones: usuario.suscripciones.map((s) => ({
        idSuscripcion: s.idSuscripcion,
        idMacrodistrito: s.idMacrodistrito,
        macrodistrito: s.macrodistrito ? s.macrodistrito.nombre : null,
        activa: s.activa,
        fechaSuscripcion: s.fechaSuscripcion,
      })),
    };
  }

  async updateProfile(idUsuario: number, updateDto: UpdateProfileDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { idUsuario } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateDto.nombre !== undefined) usuario.nombre = updateDto.nombre;
    if (updateDto.apellidos !== undefined) usuario.apellidos = updateDto.apellidos;
    if (updateDto.telefono !== undefined) usuario.telefono = updateDto.telefono;
    usuario.fechaActualizacion = new Date();

    const saved = await this.usuarioRepository.save(usuario);

    return {
      mensaje: 'Perfil actualizado exitosamente',
      usuario: {
        idUsuario: saved.idUsuario,
        nombre: saved.nombre,
        apellidos: saved.apellidos,
        correo: saved.correo,
        telefono: saved.telefono,
      },
    };
  }

  async changePassword(idUsuario: number, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { idUsuario } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.passwordActual, usuario.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    usuario.passwordHash = await bcrypt.hash(changePasswordDto.passwordNuevo, this.BCRYPT_ROUNDS);
    usuario.fechaActualizacion = new Date();
    await this.usuarioRepository.save(usuario);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }
}
