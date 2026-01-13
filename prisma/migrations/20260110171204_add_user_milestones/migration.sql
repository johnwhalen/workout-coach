-- AlterTable
ALTER TABLE "User" ADD COLUMN     "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "experience_level" TEXT;

-- CreateTable
CREATE TABLE "UserMilestone" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION,
    "target_metric" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "UserMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMilestone_user_id_idx" ON "UserMilestone"("user_id");

-- CreateIndex
CREATE INDEX "Routine_user_id_idx" ON "Routine"("user_id");

-- CreateIndex
CREATE INDEX "Set_workout_id_idx" ON "Set"("workout_id");

-- CreateIndex
CREATE INDEX "Set_date_idx" ON "Set"("date");

-- CreateIndex
CREATE INDEX "Workout_routine_id_idx" ON "Workout"("routine_id");

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "Workout"("date");

-- CreateIndex
CREATE INDEX "Workout_routine_id_date_idx" ON "Workout"("routine_id", "date");

-- AddForeignKey
ALTER TABLE "UserMilestone" ADD CONSTRAINT "UserMilestone_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
