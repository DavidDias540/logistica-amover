using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AMoVeRLogistica.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "door_number",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "floor",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "instructions",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "postal_code",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "priority",
                table: "tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "street",
                table: "tasks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "city",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "door_number",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "floor",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "instructions",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "postal_code",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "priority",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "street",
                table: "tasks");
        }
    }
}
