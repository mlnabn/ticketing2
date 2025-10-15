import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Custom hook untuk menampung state dan logika yang berulang
export const useFinancialReport = () => {
    const [detailedData, setDetailedData] = useState({ new_acquisitions: [], problematic_assets: [] });
    const [filterType, setFilterType] = useState('month');
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        month: '',
        start_date: '',
        end_date: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // --- Data Fetching untuk Tabel Detail ---
    const fetchDetailedReport = useCallback(async () => {
        setIsLoading(true);
        let params = {};
        if (filterType === 'month') {
            params = { year: filters.year, month: filters.month };
        } else if (filterType === 'date_range') {
            if (filters.start_date && filters.end_date) {
                params = { start_date: filters.start_date, end_date: filters.end_date };
            }
        }

        try {
            const detailsResponse = await api.get('/financial-report/inventory/details', { params });
            setDetailedData(detailsResponse.data);
        } catch (error) {
            console.error("Gagal mengambil detail laporan keuangan:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, filterType]);

    // Jalankan fetch setiap kali filter berubah
    useEffect(() => {
        fetchDetailedReport();
    }, [fetchDetailedReport]);

    // --- Handlers ---
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFilterTypeChange = (e) => {
        const newType = e.target.value;
        setFilterType(newType);
        const getTodayString = () => new Date().toISOString().split('T')[0];

        setFilters({
            year: new Date().getFullYear().toString(),
            month: '',
            start_date: '',
            end_date: newType === 'date_range' ? getTodayString() : ''
        });
    };

    const handleExport = async (type) => {
        setIsExporting(true);
        let params = { type };
        if (filterType === 'month') {
            params = { ...params, year: filters.year, month: filters.month };
        } else if (filterType === 'date_range') {
            params = { ...params, start_date: filters.start_date, end_date: filters.end_date };
        }

        try {
            const response = await api.get('/financial-report/export', { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = type === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `laporan-keuangan-aset-${new Date().toISOString().split('T')[0]}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Gagal mengekspor laporan:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // --- Helper & Variables ---
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

    // Return semua state dan fungsi yang dibutuhkan oleh komponen
    return {
        detailedData,
        filters,
        filterType,
        isLoading,
        isExporting,
        handleFilterChange,
        handleFilterTypeChange,
        handleExport,
        formatCurrency,
        formatDate,
        years,
        months
    };
};
