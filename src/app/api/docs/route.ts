import { NextResponse } from "next/server";

/**
 * GET /api/docs
 * Returns OpenAPI/Swagger specification for the API
 */
export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Sistem Absensi Digital API",
      description: "API untuk sistem pencatatan absensi digital dengan tanda tangan",
      version: "1.0.0",
      contact: {
        name: "Direktorat Jenderal Perhubungan Laut",
        url: "https://djpl.kemenhub.go.id",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "API Server",
      },
    ],
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Attendance", description: "Attendance management endpoints" },
      { name: "PDF", description: "PDF generation endpoints" },
    ],
    components: {
      schemas: {
        AttendanceRecord: {
          type: "object",
          properties: {
            id: { type: "string" },
            nama: { type: "string", maxLength: 255 },
            nip: { type: "string", maxLength: 50, nullable: true },
            agenda: { type: "string" },
            meetingCode: { type: "string", default: "default" },
            signatureUrl: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        HealthCheckResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["healthy", "unhealthy"] },
            timestamp: { type: "string", format: "date-time" },
            uptime: { type: "number" },
            responseTime: { type: "string" },
            environment: { type: "string" },
            services: {
              type: "object",
              properties: {
                database: { type: "string" },
                api: { type: "string" },
              },
            },
            version: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", default: false },
            message: { type: "string" },
            error: { type: "string", nullable: true },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Check API Health Status",
          description: "Returns the health status of the API and its services",
          responses: {
            200: {
              description: "API is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthCheckResponse" },
                },
              },
            },
            503: {
              description: "API is unhealthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthCheckResponse" },
                },
              },
            },
          },
        },
      },
      "/api/attendance/list": {
        get: {
          tags: ["Attendance"],
          summary: "Get Attendance Records with Pagination",
          description: "Retrieve attendance records with optional date and meeting code filtering",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number (1-indexed)",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20, maximum: 100 },
              description: "Items per page (max 100)",
            },
            {
              name: "date",
              in: "query",
              schema: { type: "string", format: "date" },
              description: "Filter by specific date (YYYY-MM-DD)",
            },
            {
              name: "meetingCode",
              in: "query",
              schema: { type: "string", default: "default" },
              description: "Meeting code to filter by",
            },
          ],
          responses: {
            200: {
              description: "Successfully retrieved attendance records",
            },
            429: {
              description: "Rate limit exceeded",
            },
            500: {
              description: "Server error",
            },
          },
        },
      },
      "/api/pdf/generate": {
        post: {
          tags: ["PDF"],
          summary: "Generate Daily Attendance PDF Report",
          description: "Generate a PDF report of attendance records for a specific date",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    date: { type: "string", format: "date" },
                    dailyLogId: { type: "string" },
                    meetingCode: { type: "string" },
                    letterheadImageUrl: { type: "string", format: "uri" },
                    institutionName: { type: "string" },
                    meetingPlace: { type: "string" },
                    meetingTitle: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "PDF generated successfully" },
            400: { description: "Invalid request parameters" },
            429: { description: "Rate limit exceeded" },
            500: { description: "Server error" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
