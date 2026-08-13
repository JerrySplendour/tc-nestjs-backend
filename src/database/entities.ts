import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique, BaseEntity as TypeOrmBaseEntity } from 'typeorm';

abstract class BaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

@Entity('users')
@Unique(['email'])
@Unique(['username'])
export class User extends BaseEntity {
    @Column()
    email!: string;
    @Column()
    username!: string;
    @Column({ name: 'password_hash' })
    passwordHash!: string;
    @Column({ name: 'first_name', default: '' })
    firstName!: string;
    @Column({ name: 'last_name', default: '' })
    lastName!: string;
    @Column({ nullable: true })
    phone?: string;
    @Column({ default: 'student' })
    role!: string;
    @Column({ name: 'is_verified', default: false })
    isVerified!: boolean;
    @Column({ name: 'avatar_url', nullable: true })
    avatarUrl?: string;
    @Column({ name: 'verification_token', nullable: true })
    verificationToken?: string;
    @Column({ name: 'reset_token', nullable: true })
    resetToken?: string;
    @Column({ name: 'reset_token_expires_at', nullable: true })
    resetTokenExpiresAt?: Date;
}

@Entity('media')
export class Media extends BaseEntity {
    @Column()
    title!: string;
    @Column()
    url!: string;
    @Column({ name: 'mime_type' })
    mimeType!: string;
    @Column({ nullable: true })
    width?: number;
    @Column({ nullable: true })
    height?: number;
    @Column({ nullable: true })
    duration?: string;
    @Column({ name: 'file_key', nullable: true })
    fileKey?: string;
}

@Entity('programs')
export class Program extends BaseEntity {
    @Column()
    title!: string;
    @Column({ type: 'text', default: '' })
    description!: string;
    @Column({ name: 'program_type', default: 'event' })
    type!: string;
    @Column({ type: 'float', default: 0 })
    price!: number;
    @Column({ name: 'billing_cycle', default: 'monthly' })
    billingCycle!: string;
    @Column({ default: true })
    active!: boolean;
    @Column({ default: false })
    featured!: boolean;
    @Column({ name: 'start_date', nullable: true })
    startDate?: string;
    @Column({ name: 'end_date', nullable: true })
    endDate?: string;
    @Column({ name: 'max_participants', default: 0 })
    maxParticipants!: number;
    @Column({ nullable: true })
    thumbnail?: string;
    @Column({ type: 'simple-json', nullable: true })
    details?: Record<string, unknown>;
}

@Entity('enrollments')
@Unique(['userId', 'programId'])
export class Enrollment extends BaseEntity {
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'program_id' })
    programId!: number;
    @Column({ default: 'active' })
    status!: string;
    @Column({ name: 'enrolled_at', type: 'datetime' })
    enrolledAt!: Date;
}

@Entity('onboarding_states')
@Unique(['userId'])
export class OnboardingState extends BaseEntity {
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'is_completed', default: false })
    isCompleted!: boolean;
    @Column({ name: 'selected_programs', type: 'simple-json', default: '[]' })
    selectedPrograms!: number[];
    @Column({ name: 'completed_at', nullable: true })
    completedAt?: Date;
}

@Entity('courses')
export class Course extends BaseEntity {
    @Column()
    title!: string;
    @Column({ type: 'text', default: '' })
    content!: string;
    @Column({ name: 'program_id', nullable: true })
    programId?: number;
    @Column({ nullable: true })
    thumbnail?: string;
    @Column({ type: 'float', default: 0 })
    rating!: number;
    @Column({ default: 0 })
    students!: number;
    @Column({ default: 'draft' })
    status!: string;
}

@Entity('course_modules')
export class CourseModule extends BaseEntity {
    @Column({ name: 'course_id' })
    courseId!: number;
    @Column()
    title!: string;
    @Column({ type: 'text', default: '' })
    content!: string;
    @Column({ default: 'draft' })
    status!: string;
    @Column({ nullable: true })
    thumbnail?: string;
    @Column({ default: 0 })
    position!: number;
}

@Entity('lessons')
export class Lesson extends BaseEntity {
    @Column({ name: 'module_id' })
    moduleId!: number;
    @Column()
    title!: string;
    @Column({ type: 'text', default: '' })
    content!: string;
    @Column({ name: 'media_type', default: 'none' })
    mediaType!: string;
    @Column({ nullable: true })
    media?: string;
    @Column({ nullable: true })
    thumbnail?: string;
    @Column({ default: '' })
    duration!: string;
    @Column({ name: 'live_link', default: '' })
    liveLink!: string;
    @Column({ name: 'scheduled_time', default: '' })
    scheduledTime!: string;
    @Column({ default: 'draft' })
    status!: string;
    @Column({ default: 0 })
    position!: number;
}

@Entity('lesson_completions')
@Unique(['userId', 'lessonId'])
export class LessonCompletion extends BaseEntity {
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'lesson_id' })
    lessonId!: number;
    @Column({ name: 'completed_at', type: 'datetime' })
    completedAt!: Date;
}

@Entity('certificates')
export class Certificate extends BaseEntity {
    @Column({ name: 'course_id' })
    courseId!: number;
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'certificate_number', unique: true })
    certificateNumber!: string;
    @Column({ name: 'issued_at', type: 'datetime' })
    issuedAt!: Date;
}

@Entity('community_posts')
export class CommunityPost extends BaseEntity {
    @Column({ name: 'program_id' })
    programId!: number;
    @Column({ name: 'author_id' })
    authorId!: number;
    @Column()
    title!: string;
    @Column({ type: 'text' })
    content!: string;
    @Column({ name: 'media_url', nullable: true })
    mediaUrl?: string;
    @Column({ default: 0 })
    likes!: number;
}

@Entity('community_comments')
export class CommunityComment extends BaseEntity {
    @Column({ name: 'post_id' })
    postId!: number;
    @Column({ name: 'author_id' })
    authorId!: number;
    @Column({ type: 'text' })
    content!: string;
}

@Entity('community_settings')
@Unique(['programId'])
export class CommunitySettings extends BaseEntity {
    @Column({ name: 'program_id' })
    programId!: number;
    @Column({ name: 'posting_enabled', default: true })
    postingEnabled!: boolean;
    @Column({ name: 'comments_enabled', default: true })
    commentsEnabled!: boolean;
    @Column({ name: 'likes_enabled', default: true })
    likesEnabled!: boolean;
}

@Entity('events')
export class Event extends BaseEntity {
    @Column({ name: 'program_id' })
    programId!: number;
    @Column()
    theme!: string;
    @Column({ name: 'event_date' })
    eventDate!: string;
    @Column({ name: 'event_time', default: '' })
    eventTime!: string;
    @Column({ default: '' })
    venue!: string;
    @Column({ type: 'float', default: 0 })
    price!: number;
    @Column({ name: 'max_capacity', default: 0 })
    maxCapacity!: number;
    @Column({ default: 'upcoming' })
    status!: string;
    @Column({ name: 'image_url', nullable: true })
    imageUrl?: string;
    @Column({ type: 'text', default: '' })
    description!: string;
}

@Entity('event_registrations')
@Unique(['eventId', 'userId'])
export class EventRegistration extends BaseEntity {
    @Column({ name: 'event_id' })
    eventId!: number;
    @Column({ name: 'user_id' })
    userId!: number;
}

@Entity('event_reviews')
export class EventReview extends BaseEntity {
    @Column({ name: 'event_id' })
    eventId!: number;
    @Column({ name: 'user_id' })
    userId!: number;
    @Column()
    title!: string;
    @Column({ type: 'text' })
    content!: string;
    @Column({ type: 'float' })
    rating!: number;
}

@Entity('fitness_sessions')
export class FitnessSession extends BaseEntity {
    @Column({ name: 'program_id' })
    programId!: number;
    @Column()
    title!: string;
    @Column({ name: 'session_date' })
    sessionDate!: string;
    @Column({ name: 'video_url', default: '' })
    videoUrl!: string;
    @Column({ name: 'duration_minutes', default: 0 })
    durationMinutes!: number;
    @Column({ default: 'upcoming' })
    status!: string;
}

@Entity('fitness_workouts')
export class FitnessWorkout extends BaseEntity {
    @Column({ name: 'session_id' })
    sessionId!: number;
    @Column()
    title!: string;
    @Column({ name: 'workout_type', default: 'general' })
    workoutType!: string;
    @Column({ default: 'medium' })
    intensity!: string;
    @Column({ name: 'duration_minutes', default: 0 })
    durationMinutes!: number;
}

@Entity('workout_completions')
@Unique(['userId', 'workoutId'])
export class WorkoutCompletion extends BaseEntity {
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'workout_id' })
    workoutId!: number;
    @Column({ name: 'completed_at', type: 'datetime' })
    completedAt!: Date;
}

@Entity('subscriptions')
export class Subscription extends BaseEntity {
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'program_id' })
    programId!: number;
    @Column({ default: 'active' })
    status!: string;
    @Column({ type: 'float' })
    amount!: number;
    @Column({ default: 'USD' })
    currency!: string;
    @Column({ name: 'payment_method', default: 'card' })
    paymentMethod!: string;
    @Column({ name: 'next_billing_date', nullable: true })
    nextBillingDate?: string;
}

@Entity('payments')
export class Payment extends BaseEntity {
    @Column({ name: 'user_id' })
    userId!: number;
    @Column({ name: 'subscription_id', nullable: true })
    subscriptionId?: number;
    @Column({ type: 'float' })
    amount!: number;
    @Column({ default: 'USD' })
    currency!: string;
    @Column({ default: 'paid' })
    status!: string;
    @Column({ name: 'provider_reference', nullable: true })
    providerReference?: string;
}


export const entities = [
    User,
    Media,
    Program,
    Enrollment,
    OnboardingState,
    Course,
    CourseModule,
    Lesson,
    LessonCompletion,
    Certificate,
    CommunityPost,
    CommunityComment,
    CommunitySettings,
    Event,
    EventRegistration,
    EventReview,
    FitnessSession,
    FitnessWorkout,
    WorkoutCompletion,
    Subscription,
    Payment];
