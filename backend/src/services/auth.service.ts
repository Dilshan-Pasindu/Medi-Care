import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { validateLogin, validateRegister, RegisterDTO } from '../dto/auth.dto';

export const authService = {
  async register(data: any) {
    const dto: RegisterDTO = validateRegister(data);

    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { user, patient } = await userRepository.createPatientUser(
      dto.name,
      dto.email,
      passwordHash,
      dto.phone,
      dto.dateOfBirth
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: patient.id,
      },
    };
  },

  async login(emailRaw: string, passwordRaw: string) {
    const { email, password } = validateLogin({ email: emailRaw, password: passwordRaw });

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let profile: any = { ...user };

    if (user.role === 'PATIENT') {
      const patient = await userRepository.getPatientByUserId(userId);
      if (patient) {
        profile.patientId = patient.id;
        profile.phone = patient.phone;
        profile.dateOfBirth = patient.date_of_birth;
      }
    } else if (user.role === 'DOCTOR') {
      const doctor = await userRepository.getDoctorByUserId(userId);
      if (doctor) {
        profile.doctorId = doctor.id;
        profile.specialistId = doctor.specialist_id;
        profile.specialistName = doctor.specialist_name;
      }
    }

    return profile;
  },
};
