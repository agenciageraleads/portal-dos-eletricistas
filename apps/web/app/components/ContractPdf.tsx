/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 24,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  text: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  box: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  signatureBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 6,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 8,
  },
});

export const ContractPdf = ({ budget }: { budget: any }) => {
  const electrician = budget.user || {};
  const clientName = budget.client_accept_name || budget.client_name || '';
  const clientCpf = budget.client_accept_cpf || '';
  const signature = budget.client_accept_signature;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
        <Text style={styles.subtitle}>Gerado via Portal do Eletricista</Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.sectionTitle}>CONTRATANTE (CLIENTE)</Text>
            <Text style={styles.text}>Nome: {clientName}</Text>
            <Text style={styles.text}>CPF: {clientCpf || 'Não informado'}</Text>
            {budget.client_phone && (
              <Text style={styles.text}>Telefone: {budget.client_phone}</Text>
            )}
          </View>
          <View style={styles.box}>
            <Text style={styles.sectionTitle}>CONTRATADO (ELETRICISTA)</Text>
            <Text style={styles.text}>Nome: {electrician.business_name || electrician.name || 'Eletricista'}</Text>
            {electrician.phone && (
              <Text style={styles.text}>Telefone: {electrician.phone}</Text>
            )}
            {electrician.city && (
              <Text style={styles.text}>Cidade: {electrician.city}/{electrician.state || ''}</Text>
            )}
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.sectionTitle}>OBJETO</Text>
          <Text style={styles.text}>
            Prestação de serviços elétricos conforme orçamento #{budget.id?.slice(0, 8).toUpperCase()}.
          </Text>
          <Text style={[styles.text, { marginTop: 6 }]}>Valor total: {formatCurrency(budget.total_price)}</Text>
        </View>

        <View style={[styles.box, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>ACEITE</Text>
          <Text style={styles.text}>
            Declaro que li e aceito as condições do orçamento e autorizo o início dos serviços.
          </Text>
        </View>

        <View style={styles.signatureBox}>
          <Text style={styles.sectionTitle}>ASSINATURA DO CLIENTE</Text>
          {signature ? (
            <Image src={signature} style={{ width: '100%', height: 120, objectFit: 'contain' }} />
          ) : (
            <Text style={styles.text}>Assinatura não informada.</Text>
          )}
          <Text style={styles.signatureLabel}>{clientName}</Text>
        </View>

        <Text style={styles.footer}>
          Documento gerado em {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </Page>
    </Document>
  );
};
