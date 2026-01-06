/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts if needed, using standard Helvetica for now to ensure compatibility
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 20,
    },
    logoSection: {
        width: '50%',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563EB', // Blue-600
        marginBottom: 5,
    },
    companyDetails: {
        fontSize: 10,
        color: '#666666',
    },
    budgetDetails: {
        width: '40%',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#111827',
    },
    label: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 2,
    },
    value: {
        fontSize: 12,
        color: '#374151',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 20,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '15%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        padding: 8,
    },
    tableColDesc: {
        width: '55%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        padding: 8,
    },
    tableCellHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableCell: {
        fontSize: 10,
        color: '#4B5563',
    },
    totals: {
        marginTop: 20,
        alignItems: 'flex-end',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '40%',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    grandTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563EB',
        marginTop: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
    },
});

interface BudgetPdfProps {
    budget: any;
}

const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    if (clean.length === 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    return phone;
};

import { getImageUrl, formatCurrency } from '@/lib/utils';

export const BudgetPdf = ({ budget }: BudgetPdfProps) => {
    const totalMaterials = Number(budget.total_materials);
    const totalLabor = Number(budget.total_labor);
    const totalPrice = Number(budget.total_price);

    // Privacy Settings (v1.2.0)
    const showUnitPrices = budget.show_unit_prices ?? true;
    const showLaborTotal = budget.show_labor_total ?? true;

    // Helper to resolve images safely
    const resolveImage = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        // Assume it's relative to API or just a path, construct full URL if possible, otherwise use base
        // But react-pdf needs a valid URL or base64. 
        // If it's a local file path (e.g. from upload), it might need the full API prefix.
        return getImageUrl(url);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {budget.user?.logo_url ? (
                            <Image
                                src={resolveImage(budget.user.logo_url) || ''}
                                style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 5 }}
                            />
                        ) : null}
                        <Text style={styles.logoText}>
                            {budget.user?.business_name || budget.user?.name || 'PORTAL DO ELETRICISTA'}
                        </Text>
                        <Text style={styles.companyDetails}>
                            {budget.user?.business_name ? budget.user.name : 'Soluções Elétricas Completas'}
                        </Text>
                        {budget.user?.phone && <Text style={styles.companyDetails}>Tel: {formatPhone(budget.user.phone)}</Text>}
                    </View>
                    <View style={styles.budgetDetails}>
                        <Text style={styles.title}>ORÇAMENTO</Text>
                        <Text style={styles.label}>NÚMERO</Text>
                        <Text style={styles.value}>#{budget.id.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.label}>DATA</Text>
                        <Text style={styles.value}>{new Date(budget.createdAt).toLocaleDateString('pt-BR')}</Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5, color: '#374151' }}>DADOS DO CLIENTE</Text>
                    <Text style={styles.value}>{budget.client_name}</Text>
                    {budget.client_phone && <Text style={styles.label}>Tel: {formatPhone(budget.client_phone)}</Text>}
                </View>

                {/* Responsible Info (if available) */}
                {budget.user && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5, color: '#374151' }}>RESPONSÁVEL TÉCNICO</Text>
                        <Text style={styles.value}>{budget.user.name}</Text>
                    </View>
                )}

                {/* Items Table - Only show if there are items */}
                {budget.items && budget.items.length > 0 && (
                    <View style={styles.table}>
                        <View style={[styles.tableRow, { backgroundColor: '#F9FAFB' }]}>
                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={styles.tableCellHeader}>IMG</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={styles.tableCellHeader}>COD.</Text>
                            </View>
                            <View style={[styles.tableColDesc, { width: '35%' }]}>
                                <Text style={styles.tableCellHeader}>PRODUTO</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={styles.tableCellHeader}>UND</Text>
                            </View>
                            <View style={[styles.tableCol, { width: '10%' }]}>
                                <Text style={styles.tableCellHeader}>QTD</Text>
                            </View>
                            {showUnitPrices && (
                                <>
                                    <View style={[styles.tableCol, { width: '12%' }]}>
                                        <Text style={styles.tableCellHeader}>V. UNIT</Text>
                                    </View>
                                    <View style={[styles.tableCol, { width: '13%' }]}>
                                        <Text style={styles.tableCellHeader}>TOTAL</Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {budget.items.map((item: any, i: number) => {
                            const imgUrl = item.is_external ? item.custom_photo_url : item.product?.image_url;
                            const resolvedImg = resolveImage(imgUrl);

                            return (
                                <View key={i} style={styles.tableRow}>
                                    <View style={[styles.tableCol, { width: '10%', padding: 2 }]}>
                                        {resolvedImg ? (
                                            // eslint-disable-next-line jsx-a11y/alt-text
                                            <Image src={resolvedImg} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                                        ) : (
                                            <Text style={[styles.tableCell, { fontSize: 8, color: '#CCC' }]}>Sem Foto</Text>
                                        )}
                                    </View>
                                    <View style={[styles.tableCol, { width: '10%' }]}>
                                        <Text style={styles.tableCell}>{item.is_external ? 'EXTRA' : item.product?.sankhya_code}</Text>
                                    </View>
                                    <View style={[styles.tableColDesc, { width: '35%' }]}>
                                        <Text style={styles.tableCell}>
                                            {item.is_external ? item.custom_name : (
                                                <>
                                                    {item.product?.name}
                                                    {item.product?.brand && ` - ${item.product.brand}`}
                                                </>
                                            )}
                                        </Text>
                                    </View>
                                    <View style={[styles.tableCol, { width: '10%' }]}>
                                        <Text style={styles.tableCell}>{item.is_external ? 'UN' : item.product?.unit || 'UN'}</Text>
                                    </View>
                                    <View style={[styles.tableCol, { width: '10%' }]}>
                                        <Text style={styles.tableCell}>{item.quantity}</Text>
                                    </View>
                                    {showUnitPrices && (
                                        <>
                                            <View style={[styles.tableCol, { width: '12%' }]}>
                                                <Text style={styles.tableCell}>{formatCurrency(item.price)}</Text>
                                            </View>
                                            <View style={[styles.tableCol, { width: '13%' }]}>
                                                <Text style={styles.tableCell}>{formatCurrency(Number(item.price) * item.quantity)}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Labor & Notes Section */}
                <View style={{ marginTop: 20 }}>
                    {/* Labor Description (if any) */}
                    {budget.labor_description && (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', marginBottom: 3 }}>DESCRIÇÃO DO SERVIÇO / MÃO DE OBRA:</Text>
                            <Text style={{ fontSize: 10, color: '#4B5563', lineHeight: 1.4 }}>{budget.labor_description}</Text>
                        </View>
                    )}

                    {/* General Notes and Conditions */}
                    {budget.notes && (
                        <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', marginBottom: 3 }}>OBSERVAÇÕES E CONDIÇÕES:</Text>
                            <Text style={{ fontSize: 9, color: '#4B5563', lineHeight: 1.4 }}>{budget.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Materiais:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalMaterials)}</Text>
                    </View>

                    {showLaborTotal ? (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Mão de Obra:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalLabor)}</Text>
                        </View>
                    ) : (
                        // If labor is hidden, it is added to the total but not shown separately here? 
                        // Or should we just show "Total Geral"?
                        // Usually hidden labor means we just show the final Price.
                        null
                    )}

                    <View style={[styles.totalRow, { marginTop: 5, borderTopWidth: 1, borderTopColor: '#DDDDDD', paddingTop: 5 }]}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>TOTAL GERAL:</Text>
                        <Text style={styles.grandTotal}>{formatCurrency(totalPrice)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Orçamento válido por 15 dias. Sujeito a alteração de preços sem aviso prévio.</Text>
                    <Text>Gerado via Portal do Eletricista</Text>
                </View>
            </Page>
        </Document>
    );
};
