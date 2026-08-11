using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAppClients.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestDetailsToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Booking",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AdultsCount",
                table: "Booking",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Booking",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Booking",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdDocumentNumber",
                table: "Booking",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdDocumentType",
                table: "Booking",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinorsCount",
                table: "Booking",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                table: "Booking",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Booking",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TravelPurpose",
                table: "Booking",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "AdultsCount",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "IdDocumentNumber",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "IdDocumentType",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "MinorsCount",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "TravelPurpose",
                table: "Booking");
        }
    }
}
