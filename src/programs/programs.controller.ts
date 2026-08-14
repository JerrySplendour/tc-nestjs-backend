import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { Enrollment, OnboardingState, Program } from '../database/entities';
import { EnrollmentStatusDto, EnrollDto, OnboardingDto, ProgramDto } from './programs.dto';

@Controller('programs')
export class ProgramsController {
    constructor(
        @InjectRepository(Program) private readonly programs: Repository<Program>,
        @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>
    ) { }

    @Get() list() {
        return this.programs.find();
    }

    @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin', 'superadmin') create(@Body() dto: ProgramDto) {
        const title = dto.title || dto.name || 'Untitled Program';
        const payload: any = { ...dto, title };
        delete payload.name;
        return this.programs.save(this.programs.create(payload));
    }

    @Get(':id') get(@Param('id') id: number) {
        return this.programs.findOneByOrFail({ id });
    }

    @Put(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin', 'superadmin') async update(@Param('id') id: number, @Body() dto: ProgramDto) {
        const payload: any = { ...dto };
        if (dto.name || dto.title) {
            payload.title = dto.title || dto.name;
            delete payload.name;
        }
        await this.programs.update(id, payload);
        return this.get(id);
    }

    @Delete(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin', 'superadmin') async remove(@Param('id') id: number) {
        await this.programs.delete(id);
        return { deleted: true };
    }

    @Get(':id/stats') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin', 'superadmin') async stats(@Param('id') id: number) {
        return { enrollments: await this.enrollments.countBy({ programId: id }) };
    }
}

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(
        @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
        @InjectRepository(OnboardingState) private readonly onboarding: Repository<OnboardingState>
    ) { }

    @Get('my-enrollments') mine(@Req() req: any) {
        return this.enrollments.findBy({ userId: req.user.id });
    }

    @Post() async enroll(@Req() req: any, @Body() dto: EnrollDto) {
        const existing = await this.enrollments.findOneBy({ userId: req.user.id, programId: dto.programId });
        return existing || this.enrollments.save(this.enrollments.create({ userId: req.user.id, programId: dto.programId, enrolledAt: new Date() }));
    }

    @Get() @UseGuards(RolesGuard) @Roles('admin', 'superadmin') list() {
        return this.enrollments.find();
    }

    @Put(':id') @UseGuards(RolesGuard) @Roles('admin', 'superadmin') async update(@Param('id') id: number, @Body() dto: EnrollmentStatusDto) {
        await this.enrollments.update(id, dto);
        return this.enrollments.findOneByOrFail({ id });
    }

    @Delete(':id') @UseGuards(RolesGuard) @Roles('admin', 'superadmin') async remove(@Param('id') id: number) {
        await this.enrollments.delete(id);
        return { deleted: true };
    }

    @Get('onboarding/status') async status(@Req() req: any) {
        return (await this.onboarding.findOneBy({ userId: req.user.id })) || { userId: req.user.id, isCompleted: false, selectedPrograms: [] };
    }

    @Post('onboarding/complete') async complete(@Req() req: any, @Body() dto: OnboardingDto) {
        let state = await this.onboarding.findOneBy({ userId: req.user.id });
        state = Object.assign(state || this.onboarding.create({ userId: req.user.id }), { isCompleted: true, selectedPrograms: dto.selectedPrograms, completedAt: new Date() });
        await this.onboarding.save(state);
        for (const programId of dto.selectedPrograms) await this.enroll(req, { programId });
        return state;
    }
}
