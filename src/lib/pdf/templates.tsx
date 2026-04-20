// src/lib/pdf/templates.tsx
// PDF Document Templates menggunakan @react-pdf/renderer

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
    paddingTop: 26,
    paddingHorizontal: 28,
    paddingBottom: 24,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111827",
    lineHeight: 1.35,
  },

  letterheadWrap: {
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 8,
    marginBottom: 10,
  },

  letterheadRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  letterheadImage: {
    width: 58,
    height: 58,
    marginRight: 10,
  },

  letterheadCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  govLine1: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.4,
  },

  govLine2: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 1,
  },

  govLine3: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 1,
  },

  govAddress: {
    textAlign: "center",
    fontSize: 8,
    marginTop: 2,
  },

  docTitleWrap: {
    marginTop: 4,
    marginBottom: 10,
    alignItems: "center",
  },

  title: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    textDecoration: "underline",
    textTransform: "uppercase",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 9,
    marginTop: 2,
  },

  infoWrap: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },

  infoLabel: {
    width: 88,
  },

  infoColon: {
    width: 8,
  },

  infoValue: {
    flex: 1,
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#111827",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    minHeight: 26,
    alignItems: "center",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    minHeight: 36,
    alignItems: "stretch",
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  tableCellBase: {
    borderRightWidth: 1,
    borderRightColor: "#9ca3af",
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: "center",
  },

  tableCellLast: {
    borderRightWidth: 0,
  },

  headerText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },

  bodyText: {
    fontSize: 9,
  },

  centered: {
    textAlign: "center",
  },

  colNo: {
    width: "7%",
    alignItems: "center",
  },

  colNama: {
    width: "29%",
  },

  colNip: {
    width: "17%",
  },

  colAgenda: {
    width: "27%",
  },

  colSignature: {
    width: "20%",
    alignItems: "center",
  },

  signatureImage: {
    width: 58,
    height: 24,
    objectFit: "contain",
  },

  emptySignature: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },

  recapWrap: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  recapText: {
    fontSize: 8,
  },

  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    paddingTop: 4,
    textAlign: "right",
  },

  footerText: {
    fontSize: 7,
    color: "#4b5563",
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
  institutionName = "KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA",
  documentTitle = "Daftar Hadir Rapat",
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
  const docNumber = `ABS/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.letterheadWrap}>
          <View style={styles.letterheadRow}>
            {letterheadImageUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image style={styles.letterheadImage} src={letterheadImageUrl} />
            ) : (
              <View style={styles.letterheadImage} />
            )}

            <View style={styles.letterheadCenter}>
              <Text style={styles.govLine1}>PEMERINTAH REPUBLIK INDONESIA</Text>
              <Text style={styles.govLine2}>{institutionName}</Text>
              <Text style={styles.govLine3}>KSOP UTAMA BELAWAN</Text>
              <Text style={styles.govAddress}>
                Jl. Raya Pelabuhan Belawan, Sumatera Utara | Telp. (061) 000000
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.docTitleWrap}>
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.subtitle}>Nomor: {docNumber}</Text>
        </View>

        <View style={styles.infoWrap}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hari</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{dayName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{dateOnly}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tempat</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{meetingPlace}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Judul Agenda Rapat</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{resolvedMeetingTitle}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jumlah Peserta</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{records.length} orang</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.tableCellBase, styles.colNo]}>
              <Text style={styles.headerText}>No</Text>
            </View>
            <View style={[styles.tableCellBase, styles.colNama]}>
              <Text style={styles.headerText}>Nama Lengkap</Text>
            </View>
            <View style={[styles.tableCellBase, styles.colNip]}>
              <Text style={styles.headerText}>Jabatan / NIP</Text>
            </View>
            <View style={[styles.tableCellBase, styles.colAgenda]}>
              <Text style={styles.headerText}>Agenda / Kegiatan</Text>
            </View>
            <View style={[styles.tableCellBase, styles.colSignature, styles.tableCellLast]}>
              <Text style={styles.headerText}>Paraf / Tanda Tangan</Text>
            </View>
          </View>

          {records.map((record, index) => {
            const isLast = index === records.length - 1;

            return (
              <View key={record.id} style={[styles.tableRow, isLast ? styles.tableRowLast : {}]}>
                <View style={[styles.tableCellBase, styles.colNo]}>
                  <Text style={[styles.bodyText, styles.centered]}>{index + 1}</Text>
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
                  {record.signatureUrl ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image style={styles.signatureImage} src={record.signatureUrl} />
                  ) : (
                    <Text style={styles.emptySignature}>-</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.recapWrap}>
          <Text style={styles.recapText}>
            Keterangan: Dokumen ini merupakan daftar hadir resmi rapat internal instansi dan
            digunakan sebagai arsip administrasi.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Sistem Manajemen Absensi Rapat - {generatedAt}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default DailyRecapPDF;
