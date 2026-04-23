// src/lib/pdf/templates.tsx
// PDF Document Templates menggunakan @react-pdf/renderer
// Desain profesional dengan logo dan layout rapi

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 28,
    paddingBottom: 24,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0f172a",
    lineHeight: 1.4,
    backgroundColor: "#ffffff",
  },

  // ===== LETTERHEAD / KOP SURAT =====
  letterheadWrap: {
    borderBottomWidth: 3,
    borderBottomColor: "#0f172a",
    paddingBottom: 12,
    marginBottom: 12,
  },

  letterheadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },

  logoContainer: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  logo: {
    width: 60,
    height: 60,
  },

  letterheadContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  // Level 1: PEMERINTAH REPUBLIK INDONESIA
  govLevel1: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.7,
    color: "#0f172a",
    marginBottom: 2,
  },

  // Level 2 & 3: KEMENTERIAN + DIREKTORAT
  govLevel23: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 1.5,
  },

  // Level 4: KANTOR KESYAHBANDARAN (Prominent)
  govLevel4: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
    marginBottom: 2,
  },

  // Level 5: Address (Normal)
  govLevel5: {
    fontSize: 7.5,
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 1.35,
    marginBottom: 1.5,
  },

  // Level 6: Contact (Normal)
  govLevel6: {
    fontSize: 7,
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 1.3,
  },

  // ===== DOCUMENT TITLE =====
  titleSection: {
    marginTop: 10,
    marginBottom: 14,
    alignItems: "center",
  },

  documentTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    textDecoration: "underline",
    color: "#000000",
    letterSpacing: 0.4,
  },

  documentNumber: {
    fontSize: 9,
    marginTop: 3,
    color: "#374151",
  },

  // ===== INFO SECTION =====
  infoSection: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-start",
  },

  infoLabel: {
    width: 115,
    fontWeight: "bold",
    color: "#1e293b",
    fontSize: 9,
  },

  infoColon: {
    width: 10,
    textAlign: "center",
    color: "#1e293b",
  },

  infoValue: {
    flex: 1,
    color: "#0f172a",
    fontSize: 9,
  },

  infoRowLast: {
    marginBottom: 0,
  },

  // ===== TABLE STYLES =====
  tableWrapper: {
    marginBottom: 10,
  },

  tableTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#0f172a",
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0f172a",
    borderStyle: "solid",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    minHeight: 30,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomColor: "#cbd5e1",
    minHeight: 42,
    alignItems: "stretch",
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  tableRowAlternate: {
    backgroundColor: "#f1f5f9",
  },

  tableCellBase: {
    borderRightWidth: 0.8,
    borderRightColor: "#cbd5e1",
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: "center",
    fontSize: 9,
  },

  tableCellHeader: {
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    fontSize: 8.5,
  },

  tableCellLast: {
    borderRightWidth: 0,
  },

  // Column widths
  colNo: {
    width: "6%",
    textAlign: "center",
  },

  colNama: {
    width: "28%",
  },

  colNip: {
    width: "18%",
  },

  colAgenda: {
    width: "24%",
  },

  colSignature: {
    width: "24%",
    textAlign: "center",
    alignItems: "center",
  },

  // ===== SIGNATURE & CONTENT =====
  signatureImage: {
    width: 50,
    height: 20,
    objectFit: "contain",
  },

  emptySignature: {
    fontSize: 8,
    color: "#94a3b8",
  },

  bodyText: {
    color: "#0f172a",
    fontSize: 9,
  },

  // ===== NOTES SECTION =====
  notesSection: {
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  notesTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#0f172a",
  },

  notesText: {
    fontSize: 8,
    color: "#1e293b",
    lineHeight: 1.4,
  },

  // ===== FOOTER =====
  footer: {
    marginTop: 12,
    paddingTop: 6,
    borderTopWidth: 0.8,
    borderTopColor: "#cbd5e1",
    textAlign: "right",
  },

  footerText: {
    fontSize: 7,
    color: "#475569",
  },

  footerNote: {
    fontSize: 6.5,
    color: "#64748b",
    marginTop: 1.5,
  },
});

interface AttendanceRecord {
  id: string;
  nama: string;
  nip?: string | null;
  agenda: string;
  signatureUrl: string;
  createdAt: Date;
}

interface DailyRecapPDFProps {
  letterheadImageUrl?: string;
  date: Date;
  records: AttendanceRecord[];
  institutionName?: string;
  documentTitle?: string;
  meetingPlace?: string;
  meetingTitle?: string;
}

export function DailyRecapPDF({
  letterheadImageUrl,
  date,
  records,
  institutionName = "DIREKTORAT JENDERAL PERHUBUNGAN LAUT",
  documentTitle = "DAFTAR HADIR PESERTA RAPAT",
  meetingPlace = "Ruang Rapat Kantor",
  meetingTitle,
}: DailyRecapPDFProps) {
  const dayName = date.toLocaleDateString("id-ID", {
    weekday: "long",
  });

  const dateOnly = date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const generatedAt = new Date().toLocaleString("id-ID");
  const resolvedMeetingTitle = meetingTitle || records[0]?.agenda || "Rapat Koordinasi";
  const docNumber = `ABS-${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;

  const terverifikasi = records.filter((r) => r.signatureUrl).length;
  const pending = records.length - terverifikasi;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== LETTERHEAD ===== */}
        <View style={styles.letterheadWrap}>
          <View style={styles.letterheadRow}>
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              {letterheadImageUrl ? (
                <Image style={styles.logo} src={letterheadImageUrl} />
              ) : (
                <View style={[styles.logo, { backgroundColor: "#e5e7eb" }]} />
              )}
            </View>

            {/* Organization Info */}
            <View style={styles.letterheadContent}>
              <Text style={styles.govLevel1}>PEMERINTAH REPUBLIK INDONESIA</Text>
              <Text style={styles.govLevel23}>KEMENTERIAN PERHUBUNGAN</Text>
              <Text style={styles.govLevel4}>KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN UTAMA BELAWAN</Text>
              <Text style={styles.govLevel5}>
                Jl. Deli No.1
              </Text>
              <Text style={styles.govLevel6}>
                Telepon: (061) 6940018 • Faksimili: (061) 6940018 • Email: kasopbelawan@kemenhub.go.id
              </Text>
            </View>
          </View>
        </View>

        {/* ===== DOCUMENT TITLE ===== */}
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>{documentTitle}</Text>
          <Text style={styles.documentNumber}>Nomor: {docNumber}</Text>
        </View>

        {/* ===== MEETING INFO ===== */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hari / Tanggal</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{dayName}, {dateOnly}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu Pelaksanaan</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>08:00 WIB - Selesai</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tempat / Ruangan</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{meetingPlace}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Kegiatan / Rapat</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{resolvedMeetingTitle}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Total Peserta</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{records.length} Orang ({terverifikasi} Terverifikasi, {pending} Pending)</Text>
          </View>
        </View>

        {/* ===== ATTENDANCE TABLE ===== */}
        <View style={styles.tableWrapper}>
          <Text style={styles.tableTitle}>Daftar Peserta Rapat</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableCellBase, styles.colNo]}>
                <Text style={styles.tableCellHeader}>NO</Text>
              </View>
              <View style={[styles.tableCellBase, styles.colNama]}>
                <Text style={styles.tableCellHeader}>NAMA LENGKAP</Text>
              </View>
              <View style={[styles.tableCellBase, styles.colNip]}>
                <Text style={styles.tableCellHeader}>JABATAN/NIP</Text>
              </View>
              <View style={[styles.tableCellBase, styles.colAgenda]}>
                <Text style={styles.tableCellHeader}>AGENDA/KEGIATAN</Text>
              </View>
              <View style={[styles.tableCellBase, styles.colSignature, styles.tableCellLast]}>
                <Text style={styles.tableCellHeader}>PARAF/TTD</Text>
              </View>
            </View>

            {/* Table Body */}
            {records.map((record, index) => {
              const isLast = index === records.length - 1;
              const isAlternate = index % 2 === 1;

              return (
                <View
                  key={record.id}
                  style={[
                    styles.tableRow,
                    ...(isLast ? [styles.tableRowLast] : []),
                    ...(isAlternate ? [styles.tableRowAlternate] : []),
                  ]}
                >
                  <View style={[styles.tableCellBase, styles.colNo]}>
                    <Text style={[styles.bodyText, { textAlign: "center" }]}>{index + 1}</Text>
                  </View>
                  <View style={[styles.tableCellBase, styles.colNama]}>
                    <Text style={styles.bodyText}>{record.nama}</Text>
                  </View>
                  <View style={[styles.tableCellBase, styles.colNip]}>
                    <Text style={styles.bodyText}>{record.nip || "-"}</Text>
                  </View>
                  <View style={[styles.tableCellBase, styles.colAgenda]}>
                    <Text style={styles.bodyText}>{record.agenda}</Text>
                  </View>
                  <View style={[styles.tableCellBase, styles.colSignature, styles.tableCellLast]}>
                    {record.signatureUrl && record.signatureUrl.length > 100 ? (
                      <Image style={styles.signatureImage} src={record.signatureUrl} />
                    ) : (
                      <Text style={styles.emptySignature}>-</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ===== NOTES ===== */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>KETERANGAN:</Text>
          <Text style={styles.notesText}>
            • Dokumen ini adalah salinan resmi daftar hadir rapat yang diselenggarakan oleh KSOP Utama Belawan{"\n"}
            • Paraf/Tanda tangan digital menunjukkan verifikasi kehadiran peserta rapat{"\n"}
            • Untuk verifikasi lebih lanjut, hubungi bagian administrasi/tata usaha
          </Text>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sistem Manajemen Absensi Rapat Elektronik | Generated: {generatedAt}
          </Text>
          <Text style={styles.footerNote}>
            © 2026 KSOP Utama Belawan | Document ID: {docNumber}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default DailyRecapPDF;
