using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WebAppClients.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationSourceAndFolio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Folio",
                table: "Booking",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReservationSource",
                table: "Booking",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Otro");

            migrationBuilder.CreateTable(
                name: "Sequences",
                columns: table => new
                {
                    Origin = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Prefix = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    NextValue = table.Column<int>(type: "int", nullable: false),
                    PadLength = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sequences", x => x.Origin);
                });

            migrationBuilder.InsertData(
                table: "Sequences",
                columns: new[] { "Origin", "NextValue", "PadLength", "Prefix" },
                values: new object[,]
                {
                    { "Agencia", 1, 6, "AG" },
                    { "AppMobile", 1, 6, "AP" },
                    { "Internet", 1, 6, "IN" },
                    { "Otro", 1, 6, "OT" },
                    { "Telefono", 1, 6, "TL" },
                    { "WalkIn", 1, 6, "WI" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sequences");

            migrationBuilder.DropColumn(
                name: "Folio",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "ReservationSource",
                table: "Booking");
        }
    }
}
