/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         nama:
 *           type: string
 *           maxLength: 255
 *         nip:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *         agenda:
 *           type: string
 *         meetingCode:
 *           type: string
 *           default: "default"
 *         signatureUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedAttendanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             hasMore:
 *               type: boolean
 *
 *     HealthCheckResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptime:
 *           type: number
 *         responseTime:
 *           type: string
 *         environment:
 *           type: string
 *         services:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *             api:
 *               type: string
 *         version:
 *           type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API Health Status
 *     description: Returns the health status of the API and its services
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 */

/**
 * @swagger
 * /api/attendance/list:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get Attendance Records with Pagination
 *     description: Retrieve attendance records with optional date and meeting code filtering
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - name: date
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *       - name: meetingCode
 *         in: query
 *         schema:
 *           type: string
 *           default: "default"
 *         description: Meeting code to filter by
 *     responses:
 *       200:
 *         description: Successfully retrieved attendance records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAttendanceResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/pdf/generate:
 *   post:
 *     tags:
 *       - PDF
 *     summary: Generate Daily Attendance PDF Report
 *     description: Generate a PDF report of attendance records for a specific date
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date in YYYY-MM-DD format (required if dailyLogId not provided)
 *               dailyLogId:
 *                 type: string
 *                 description: Daily log ID (required if date not provided)
 *               meetingCode:
 *                 type: string
 *                 description: Meeting code
 *               letterheadImageUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to letterhead image
 *               institutionName:
 *                 type: string
 *                 description: Institution name for the report
 *               meetingPlace:
 *                 type: string
 *                 description: Location where the meeting took place
 *               meetingTitle:
 *                 type: string
 *                 description: Title of the meeting
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pdfUrl:
 *                   type: string
 *       400:
 *         description: Invalid request parameters
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */

export {};
