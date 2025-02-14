/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief service for User queries
 */
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { EAccountStatus } from 'src/common/Enum/EAccountStatus.enum';
import { EGender } from 'src/common/Enum/EGender.enum';
import { ERole } from 'src/common/Enum/ERole.enum';
import { User } from 'src/entities/user.entity';
import { UtilsService } from 'src/utils/utils.service';
import { LoginDTO } from 'src/common/dtos/lodin.dto';
import { UUID } from 'crypto';
import { EUserType } from 'src/common/Enum/EUserType.enum';
import { MailingService } from 'src/integrations/mailing/mailing.service';
import { RoleService } from '../roles/role.service';
import { CreateAdminDto } from 'src/common/dtos/create-admin.dto';
import { CreateUserByAdminDto } from 'src/common/dtos/create-user.dto';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/common/dtos/update-user.dto';
import { SalesService } from '../sales/sales.service';
import { Sale } from 'src/entities/sales.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(Sale) public saleRepo: Repository<Sale>,
    // @Inject(forwardRef(() => RoleService))
    private roleService: RoleService,
    @Inject(forwardRef(() => UtilsService))
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private jwtService: JwtService,
    private utilsService: UtilsService,
    private mailingService: MailingService,
  ) { }

  async getUsers() {
    const response = await this.userRepo.find({ relations: ['roles'] });
    return response;
  }

  async getUserByEmail(email: any) {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      },
      relations: ['roles'],
    });
    if (!user)
      throw new NotFoundException(
        'The user with the provided email is not found',
      );
    return user;
  }
  async getUserByVerificationCode(code: number) {
    const user = await this.userRepo.findOne({
      where: {
        activationCode: code,
      },
      relations: ['roles'],
    });
    return user;
  }

  async getOneByEmail(email: any) {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      },
      relations: ['roles'],
    });
    return user;
  }

  async getUserById(id: UUID, entity: String) {
    const response = await this.userRepo.findOne({
      where: {
        id: id,
      },
      relations: ['roles'],
    });
    if (!response) {
      throw new NotFoundException(`${entity} not found`);
    }
    return response;
  }

  generateRandomFourDigitNumber(): number {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async login(dto: LoginDTO) {
    const user = await this.getOneByEmail(dto.email);
    if (user.status == EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION])
      throw new BadRequestException(
        'This account is not yet verified, please check your gmail inbox for verification details',
      );
    const tokens = this.utilsService.getTokens(user);
    delete user.password;
    return {
      access: (await tokens).accessToken,
      refresh_token: (await tokens).refreshToken,
      user: user,
    };
  }

  async verifyAccount(code: number) {
    const verifiedAccount = await this.getUserByVerificationCode(code);
    if (!verifiedAccount)
      throw new BadRequestException(
        'The provided verification code is invalid',
      );
    if (verifiedAccount.status === EAccountStatus[EAccountStatus.ACTIVE])
      throw new BadRequestException('This is already verified');
    verifiedAccount.status = EAccountStatus[EAccountStatus.ACTIVE];
    const updatedAccount = await this.userRepo.save(verifiedAccount);
    const tokens = await this.utilsService.getTokens(updatedAccount);
    delete updatedAccount.password;
    delete updatedAccount.activationCode;

    return { tokens, user: updatedAccount };
  }

  async resetPassword(code: number, newPassword: string) {
    const account = await this.getUserByVerificationCode(code);
    if (!account)
      throw new BadRequestException(
        'The provided code is invalid',
      );

    account.password = await this.utilsService.hashString(
      newPassword.toString(),
    );
    if (
      account.status == EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION]
    )
      account.status = EAccountStatus[EAccountStatus.ACTIVE]
    const savedUser = await this.userRepo.save(account);
    const tokens = await this.utilsService.getTokens(account);
    delete savedUser.password;
    delete savedUser.activationCode;
    return { tokens, user: savedUser };
  }

  async getVerificationCode(email: string, reset: boolean) {
    const account = await this.getUserByEmail(email);
    if (!account) throw new BadRequestException('This account does not exist');

    account.activationCode = this.generateRandomFourDigitNumber();
    if (reset) account.status = EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION];
    await this.userRepo.save(account);
    this.mailingService.sendEmail(`https://${process.env.FRONT_END_URL}/verify-account?email=${account.email}&code=${account.activationCode}r`, true, account);
    return { code: account.activationCode };
  }

  async getResetPasswordToken(email: string, reset: boolean) {
    const account = await this.getUserByEmail(email);
    if (!account) throw new BadRequestException('This account does not exist');
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await this.utilsService.hashString(tempPassword);
    account.password = hashedPassword;
    account.activationCode = this.generateRandomFourDigitNumber();
    if (reset) account.status = EAccountStatus[EAccountStatus.INACTIVE];
    await this.userRepo.save(account);
    this.mailingService.sendEmail(`https://${process.env.FRONT_END_URL}/forgot-password?email=${account.email}&code=${account.activationCode}`, true, account);
    return { activationCode: account.activationCode, temporaryPassword: tempPassword };
  }
  //create admin
  async createAdmin(body: CreateAdminDto) {
    let {
      firstName,
      lastName,
      email,
      username,
      myGender,
      registercode,
      national_id,
      phonenumber,
      password,
    } = body;
    console.log(registercode);
    if (registercode != 'KabstoreKeyAdmin') {
      return new UnauthorizedException('Incorrect Registration Key');
    }

    let email2: any = email;
    const userFetched = await this.userRepo.findOne({
      where: {
        email: email2,
      },
    });
    if (userFetched) return new UnauthorizedException('Email already exists');

    const status: String =
      EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION].toString();
    let gender;
    const role = await this.roleService.getRoleByName(ERole[ERole.ADMIN]);
    switch (myGender.toLowerCase()) {
      case 'male':
        gender = EGender[EGender.MALE];
        break;
      case 'female':
        gender = EGender[EGender.FEMALE];
        break;
      default:
        throw new BadRequestException(
          'The provided gender is invalid, should male or female',
        );
    }
    const userToCreate = new User(
      firstName,
      lastName,
      email,
      username,
      gender,
      national_id,
      phonenumber,
      password,
      EAccountStatus.ACTIVE,
    );
    userToCreate.activationCode = this.generateRandomFourDigitNumber();
    userToCreate.password = await this.utilsService.hashString(password);
    try {
      const userEntity = this.userRepo.create(userToCreate);
      const createdEnity = await this.userRepo.save({ ...userEntity, roles: [role] });
      await this.mailingService.sendEmail(`https://${process.env.FRONT_END_URL}/forgot-password?email=${createdEnity.email}&code=${createdEnity.activationCode}`, false, createdEnity);
      return {
        success: true,
        message: `Account created successfully!`,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //create another user [SALES_PERSON OR OPERATIONS MANAGER] by admin
  async createUser(body: CreateUserByAdminDto) {
    let {
      firstName,
      lastName,
      email,
      username,
      myGender,
      national_id,
      role,
      phonenumber,
    } = body;

    let email2: any = email;
    const userFetched = await this.userRepo.findOne({
      where: {
        email: email2,
      },
    });
    if (userFetched) return new UnauthorizedException('Email already exists');
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await this.utilsService.hashString(tempPassword);
    let gender;
    const erole = await this.roleService.getRoleByName(role);
    switch (myGender.toLowerCase()) {
      case 'male':
        gender = EGender[EGender.MALE];
        break;
      case 'female':
        gender = EGender[EGender.FEMALE];
        break;
      default:
        throw new BadRequestException(
          'The provided gender is invalid, should male or female',
        );
    }
    const userToCreate = new User(
      firstName,
      lastName,
      email,
      username,
      gender,
      national_id,
      phonenumber,
      hashedPassword,
      EAccountStatus.WAIT_EMAIL_VERIFICATION,
    );
    userToCreate.activationCode = this.generateRandomFourDigitNumber();
    try {
      const userEntity = this.userRepo.create(userToCreate);
      const tokens = await this.utilsService.getTokens(userEntity);
      const createdEnity = await this.userRepo.save({
        ...userEntity,
        resetToken: tokens.accessToken.toString(),
        roles: [erole],
      });
      await this.mailingService.sendEmail(
        `https://${process.env.FRONT_END_URL}/forgot-password?email=${createdEnity.email}&code=${createdEnity.activationCode}`,
        true,
        createdEnity,
      );
      return {
        success: true,
        message: `User account created successfully! ${createdEnity.activationCode}`,
        password: tempPassword,
        token: createdEnity.activationCode,
      };
    } catch (error) {
      console.log(error);
    }
  }

 

  async verifyProfile(code: number) {
    try {
    } catch (error) {
      console.log(error);
    }
  }

  async updateUser(id: UUID, dto: UpdateUserDto) {
    const user = await this.getUserById(id, 'User');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    const erole = await this.roleService.getRoleByName(dto.role);

    user.roles = [erole];
    return this.userRepo.save(user);
  }
  async assignRoleToUser(userId: UUID, roleName: any, userType: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const role = this.roleService.roleRepo.findOne({
      where: { role_name: roleName },
    });
    if (!role)
      throw new NotFoundException(
        'The role with the provided id is not foound',
      );

    let roles = [];
    roles = user.roles;
    roles.push(role);
    user.roles = roles;
    switch (userType.toUpperCase()) {
      case EUserType[EUserType.USER]:
      case EUserType[EUserType.ADMIN]:
      default:
        throw new BadRequestException('The provided userType is invalid');
    }
  }

  async deleteUser(id: UUID) {
    const user = await this.getUserById(id, 'User');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.userRepo.remove(user);
    return user;
  }

  async getUserPerformance(userId: UUID, startDate?: Date, endDate?: Date) {
    try {
      const user = await this.getUserById(userId, 'User');
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get base query for user's sales
      const baseQuery = this.saleRepo.createQueryBuilder('sale')
        .where('sale.doneBy = :userId', { userId })
        .andWhere(startDate && endDate ? 
          'sale."saleDate" BETWEEN :startDate AND :endDate' : '1=1', 
          { startDate, endDate }
        );

      // Get sales summary
      const salesSummary = await baseQuery
        .select([
          'COUNT(DISTINCT sale.id) as "totalSales"',
          'COUNT(DISTINCT sale.customer_id) as "totalCustomers"',
          'COALESCE(SUM(sale.totalPrice), 0) as "totalRevenue"',
          'COALESCE(SUM(sale.amountDue), 0) as "totalOutstanding"',
          // Payment methods count
          'COUNT(CASE WHEN sale.paymentType = \'MOBILE_MONEY\' THEN 1 END) as "mobileMoneyCount"',
          'COUNT(CASE WHEN sale.paymentType = \'CASH\' THEN 1 END) as "cashCount"',
          'COUNT(CASE WHEN sale.paymentType = \'BANK\' THEN 1 END) as "bankCount"',
          // Sales status count
          'COUNT(CASE WHEN sale.amountDue > 0 THEN 1 END) as "creditSales"',
          'COUNT(CASE WHEN sale.amountDue = 0 THEN 1 END) as "completedSales"'
        ])
        .getRawOne();

      // Get sales trends
      const salesTrends = await baseQuery
        .select([
          'DATE_TRUNC(\'day\', sale.saleDate) as date',
          'COUNT(DISTINCT sale.id) as "dailySales"',
          'COALESCE(SUM(sale.totalPrice), 0) as "dailyRevenue"'
        ])
        .groupBy('DATE_TRUNC(\'day\', sale.saleDate)')
        .orderBy('DATE_TRUNC(\'day\', sale.saleDate)', 'DESC')
        .limit(30)
        .getRawMany();

      // Get recent sales - Separate query without grouping
      const recentSales = await this.saleRepo
        .createQueryBuilder('sale')
        .where('sale.doneBy = :userId', { userId })
        .andWhere(startDate && endDate ? 
          'sale.saleDate BETWEEN :startDate AND :endDate' : '1=1', 
          { startDate, endDate }
        )
        .leftJoinAndSelect('sale.customer', 'customer')
        .leftJoinAndSelect('sale.saleItems', 'saleItems')
        .leftJoinAndSelect('saleItems.product', 'product')
        .orderBy('sale.saleDate', 'DESC')
        .limit(10)
        .getMany();

      return {
        summary: {
          totalSales: Number(salesSummary.totalSales),
          totalCustomers: Number(salesSummary.totalCustomers),
          totalRevenue: Number(salesSummary.totalRevenue),
          totalOutstanding: Number(salesSummary.totalOutstanding),
          paymentMethods: {
            mobileMoney: Number(salesSummary.mobileMoneyCount),
            cash: Number(salesSummary.cashCount),
            bank: Number(salesSummary.bankCount)
          },
          salesStatus: {
            credit: Number(salesSummary.creditSales),
            completed: Number(salesSummary.completedSales)
          }
        },
        trends: salesTrends.map(trend => ({
          date: trend.date,
          sales: Number(trend.dailySales),
          revenue: Number(trend.dailyRevenue)
        })),
        recentSales: recentSales.map(sale => ({
          id: sale.id,
          date: sale.saleDate,
          customer: sale.customer ? `${sale.customer.name}` : 'N/A',
          amount: sale.totalPrice,
          outstanding: sale.amountDue,
          paymentMethod: sale.paymentType,
          items: sale.saleItems.map(item => ({
            product: item.product.name,
            quantity: item.quantity
          }))
        }))
      };
    } catch (error) {
      throw new BadRequestException('Error fetching user performance: ' + error.message);
    }
  }
}
