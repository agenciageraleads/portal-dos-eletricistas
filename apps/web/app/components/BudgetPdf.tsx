/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts if needed, using standard Helvetica for now to ensure compatibility
// Register fonts if needed, using standard Helvetica for now to ensure compatibility
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 24,
        fontFamily: 'Helvetica',
    },
    brandBar: {
        height: 6,
        backgroundColor: '#1D4ED8',
        borderRadius: 4,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 10,
    },
    logoSection: {
        width: '50%',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1D4ED8',
        marginBottom: 5,
    },
    companyDetails: {
        fontSize: 9,
        color: '#666666',
    },
    budgetDetails: {
        width: '40%',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#111827',
    },
    label: {
        fontSize: 8,
        color: '#6B7280',
        marginBottom: 1,
    },
    value: {
        fontSize: 10,
        color: '#374151',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    section: {
        margin: 5,
        padding: 5,
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
        marginTop: 10,
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
        padding: 4,
    },
    tableColDesc: {
        width: '55%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        padding: 4,
    },
    tableCellHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableCell: {
        fontSize: 9,
        color: '#4B5563',
    },
    totals: {
        marginTop: 10,
        alignItems: 'flex-end',
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '40%',
        marginBottom: 2,
    },
    totalLabel: {
        fontSize: 9,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111827',
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1D4ED8',
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 16,
        left: 24,
        right: 24,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 5,
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
        if (url.startsWith('data:')) return url;
        return getImageUrl(url) || undefined;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.brandBar} />
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {budget.user?.logo_url ? (
                            <Image
                                src={resolveImage(budget.user.logo_url)}
                                style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 6 }}
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
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2, color: '#374151' }}>DADOS DO CLIENTE</Text>
                    <Text style={styles.value}>{budget.client_name}</Text>
                    {budget.client_phone && <Text style={styles.label}>Tel: {formatPhone(budget.client_phone)}</Text>}
                </View>

                {/* Responsible Info (if available) */}
                {budget.user && (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2, color: '#374151' }}>RESPONSÁVEL TÉCNICO</Text>
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
                            const imgUrl = item.is_external ? item.custom_photo_url : (item.product?.image_url || item.product?.imageUrl);
                            const resolvedImg = resolveImage(imgUrl);

                            return (
                                <View key={i} style={styles.tableRow} wrap={false}>
                                    <View style={[styles.tableCol, { width: '10%', padding: 2 }]}>
                                        {resolvedImg ? (
                                            // eslint-disable-next-line jsx-a11y/alt-text
                                            <Image src={resolvedImg} style={{ width: 25, height: 25, objectFit: 'contain' }} />
                                        ) : (
                                            <Text style={[styles.tableCell, { fontSize: 7, color: '#CCC' }]}>Sem Foto</Text>
                                        )}
                                    </View>
                                    <View style={[styles.tableCol, { width: '10%' }]}>
                                        <Text style={styles.tableCell}>{item.is_external ? 'EXTRA' : (item.product?.type === 'SERVICE' ? 'SERV' : item.product?.sankhya_code)}</Text>
                                    </View>
                                    <View style={[styles.tableColDesc, { width: '35%' }]}>
                                        <Text style={styles.tableCell}>
                                            {item.is_external ? item.custom_name : (
                                                <>
                                                    {item.product?.name}
                                                    {item.product?.type !== 'SERVICE' && item.product?.brand && ` - ${item.product.brand}`}
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
                <View style={{ marginTop: 10 }} wrap={false}>
                    {/* Labor Description (if any) */}
                    {budget.labor_description && (
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#374151', marginBottom: 2 }}>DESCRIÇÃO DO SERVIÇO / MÃO DE OBRA:</Text>
                            <Text style={{ fontSize: 9, color: '#4B5563', lineHeight: 1.3 }}>{budget.labor_description}</Text>
                        </View>
                    )}

                    {/* Commercial Conditions */}
                    {(() => {
                        const conditions = {
                            execution: budget.execution_time,
                            payment: budget.payment_terms,
                            validity: budget.validity,
                            warranty: budget.warranty
                        };
                        const hasConditions = Object.values(conditions).some(Boolean);

                        return (
                            <>
                                {hasConditions && (
                                    <View style={{ marginBottom: 10, padding: 5, backgroundColor: '#F9FAFB', borderRadius: 4, borderLeftWidth: 2, borderLeftColor: '#2563EB' }}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827', marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 2 }}>
                                            CONDIÇÕES COMERCIAIS
                                        </Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                            {conditions.execution && (
                                                <View style={{ width: '45%', marginBottom: 3 }}>
                                                    <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 1 }}>Prazo de Execução:</Text>
                                                    <Text style={{ fontSize: 9, color: '#111827', fontWeight: 'bold' }}>{conditions.execution}</Text>
                                                </View>
                                            )}
                                            {conditions.payment && (
                                                <View style={{ width: '45%', marginBottom: 3 }}>
                                                    <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 1 }}>Forma de Pagamento:</Text>
                                                    <Text style={{ fontSize: 9, color: '#111827', fontWeight: 'bold' }}>{conditions.payment}</Text>
                                                </View>
                                            )}
                                            {conditions.validity && (
                                                <View style={{ width: '45%', marginBottom: 3 }}>
                                                    <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 1 }}>Validade da Proposta:</Text>
                                                    <Text style={{ fontSize: 9, color: '#111827', fontWeight: 'bold' }}>{conditions.validity}</Text>
                                                </View>
                                            )}
                                            {conditions.warranty && (
                                                <View style={{ width: '45%', marginBottom: 3 }}>
                                                    <Text style={{ fontSize: 8, color: '#6B7280', marginBottom: 1 }}>Garantia:</Text>
                                                    <Text style={{ fontSize: 9, color: '#111827', fontWeight: 'bold' }}>{conditions.warranty}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}

                                {/* General Notes */}
                                {budget.notes && (
                                    <View style={{ marginBottom: 10, padding: 5, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#374151', marginBottom: 2 }}>OBSERVAÇÕES GERAIS:</Text>
                                        <Text style={{ fontSize: 8, color: '#4B5563', lineHeight: 1.3 }}>{budget.notes}</Text>
                                    </View>
                                )}
                            </>
                        );
                    })()}
                </View>

                {/* Totals */}
                <View style={styles.totals} wrap={false}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Materiais:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalMaterials)}</Text>
                    </View>

                    {showLaborTotal ? (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Mão de Obra:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalLabor)}</Text>
                        </View>
                    ) : null}

                    <View style={[styles.totalRow, { marginTop: 2, borderTopWidth: 1, borderTopColor: '#DDDDDD', paddingTop: 3 }]}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>TOTAL GERAL:</Text>
                        <Text style={styles.grandTotal}>{formatCurrency(totalPrice)}</Text>
                    </View>
                </View>

                {/* Client Acceptance (if approved) */}
                {(budget.status === 'APPROVED' || budget.client_accept_signature) && (
                    <View style={{ marginTop: 12, padding: 6, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 4 }} wrap={false}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', marginBottom: 4 }}>ACEITE DO CLIENTE</Text>
                        <Text style={{ fontSize: 9, color: '#4B5563' }}>Nome: {budget.client_accept_name || budget.client_name || ''}</Text>
                        <Text style={{ fontSize: 9, color: '#4B5563' }}>CPF: {budget.client_accept_cpf || 'Não informado'}</Text>
                        {budget.client_accept_signature ? (
                            <Image src={budget.client_accept_signature} style={{ width: 160, height: 60, objectFit: 'contain', marginTop: 6 }} />
                        ) : null}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text>Orçamento válido por 15 dias. Sujeito a alteração de preços sem aviso prévio.</Text>
                    <Text>Gerado via Portal do Eletricista</Text>
                </View>
            </Page>
        </Document>
    );
};
