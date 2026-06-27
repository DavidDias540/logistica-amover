using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModelsForLogistics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "vehicleID",
                table: "tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "LocationNode",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_vehicleID",
                table: "tasks",
                column: "vehicleID");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_vehicles_vehicleID",
                table: "tasks",
                column: "vehicleID",
                principalTable: "vehicles",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tasks_vehicles_vehicleID",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_vehicleID",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "vehicleID",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "status",
                table: "LocationNode");
        }
    }
}
