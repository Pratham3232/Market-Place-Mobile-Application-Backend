/*
  Warnings:

  - You are about to drop the `WorkspacePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceUserPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER');

-- DropForeignKey
ALTER TABLE "WorkspacePermission" DROP CONSTRAINT "WorkspacePermission_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceUserPermission" DROP CONSTRAINT "WorkspaceUserPermission_workspacePermissionId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceUserPermission" DROP CONSTRAINT "WorkspaceUserPermission_workspaceUserId_fkey";

-- AlterTable
ALTER TABLE "WorkspaceUser" ADD COLUMN     "role" "RoleType" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "WorkspacePermission";

-- DropTable
DROP TABLE "WorkspaceUserPermission";
