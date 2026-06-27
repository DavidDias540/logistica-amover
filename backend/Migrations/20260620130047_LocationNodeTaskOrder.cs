using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class LocationNodeTaskOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LocationNodeTask_LocationNode_NodesID",
                table: "LocationNodeTask");

            migrationBuilder.DropForeignKey(
                name: "FK_LocationNodeTask_tasks_tasksID",
                table: "LocationNodeTask");



            migrationBuilder.DropPrimaryKey(
                name: "PK_LocationNodeTask",
                table: "LocationNodeTask");

            migrationBuilder.DropIndex(
                name: "IX_LocationNodeTask_tasksID",
                table: "LocationNodeTask");

            migrationBuilder.RenameColumn(
                name: "tasksID",
                table: "LocationNodeTask",
                newName: "stopOrder");

            migrationBuilder.RenameColumn(
                name: "NodesID",
                table: "LocationNodeTask",
                newName: "TaskID");

            migrationBuilder.AddColumn<int>(
                name: "NodeID",
                table: "LocationNodeTask",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_LocationNodeTask",
                table: "LocationNodeTask",
                columns: new[] { "NodeID", "TaskID" });

            migrationBuilder.CreateIndex(
                name: "IX_LocationNodeTask_TaskID",
                table: "LocationNodeTask",
                column: "TaskID");

            migrationBuilder.AddForeignKey(
                name: "FK_LocationNodeTask_LocationNode_NodeID",
                table: "LocationNodeTask",
                column: "NodeID",
                principalTable: "LocationNode",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LocationNodeTask_tasks_TaskID",
                table: "LocationNodeTask",
                column: "TaskID",
                principalTable: "tasks",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LocationNodeTask_LocationNode_NodeID",
                table: "LocationNodeTask");

            migrationBuilder.DropForeignKey(
                name: "FK_LocationNodeTask_tasks_TaskID",
                table: "LocationNodeTask");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LocationNodeTask",
                table: "LocationNodeTask");

            migrationBuilder.DropIndex(
                name: "IX_LocationNodeTask_TaskID",
                table: "LocationNodeTask");

            migrationBuilder.DropColumn(
                name: "NodeID",
                table: "LocationNodeTask");

            migrationBuilder.RenameColumn(
                name: "stopOrder",
                table: "LocationNodeTask",
                newName: "tasksID");

            migrationBuilder.RenameColumn(
                name: "TaskID",
                table: "LocationNodeTask",
                newName: "NodesID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LocationNodeTask",
                table: "LocationNodeTask",
                columns: new[] { "NodesID", "tasksID" });



            migrationBuilder.CreateIndex(
                name: "IX_LocationNodeTask_tasksID",
                table: "LocationNodeTask",
                column: "tasksID");

            migrationBuilder.CreateIndex(
                name: "IX_deliveryRoutePoints_DeliveryRouteID",
                table: "deliveryRoutePoints",
                column: "DeliveryRouteID");

            migrationBuilder.CreateIndex(
                name: "IX_deliveryRoutePoints_TaskID",
                table: "deliveryRoutePoints",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_deliveryRoutes_VehicleID",
                table: "deliveryRoutes",
                column: "VehicleID");

            migrationBuilder.AddForeignKey(
                name: "FK_LocationNodeTask_LocationNode_NodesID",
                table: "LocationNodeTask",
                column: "NodesID",
                principalTable: "LocationNode",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LocationNodeTask_tasks_tasksID",
                table: "LocationNodeTask",
                column: "tasksID",
                principalTable: "tasks",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
