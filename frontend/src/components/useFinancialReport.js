import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFinancialReport = (isPresent) => {
    const [summaryData, setSummaryData] = useState({
        total_asset_value: 0,
        net_asset_value: 0,
        new_asset_value: 0,
        problematic_asset_value: 0,
    });
    const [detailedData, setDetailedData] = useState({ new_acquisitions: [], problematic_assets: [] });
    const [chartData, setChartData] = useState({ bar: null, pie: null });
    const [filterType, setFilterType] = useState('month');
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        month: '',
        start_date: '',
        end_date: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            let apiParams = {};
            if (filterType === 'month') {
                apiParams = { year: filters.year, month: filters.month };
            } else if (filters.start_date && filters.end_date) {
                apiParams = { start_date: filters.start_date, end_date: filters.end_date };
            }
            const [summaryRes, detailsRes, barChartRes, pieChartRes] = await Promise.all([
                api.get('/financial-report/inventory', { params: apiParams }),
                api.get('/financial-report/inventory/details', { params: apiParams }),
                api.get('/financial-report/value-by-category'),
                api.get('/financial-report/asset-composition')
            ]);

            setSummaryData(summaryRes.data);
            setDetailedData(detailsRes.data);
            setChartData({ bar: barChartRes.data, pie: pieChartRes.data });

        } catch (error) {
            console.error("Gagal mengambil data laporan keuangan:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, filterType]);

    useEffect(() => {
        if (!isPresent) return;
        fetchData();
    }, [fetchData, isPresent]);
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setFilters({
            year: new Date().getFullYear().toString(),
            month: '', start_date: '', end_date: ''
        });
    };

    const handleExport = async (type, reportView) => {
        setIsExporting(true);
        let params = { 
            type,
            report_view: reportView
        };
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
            link.setAttribute('download', `laporan-${reportView}-${new Date().toISOString().split('T')[0]}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Gagal mengekspor laporan:', error);
        } finally {
            setIsExporting(false);
        }
    };

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

    return {
        summaryData,
        detailedData, 
        chartData,
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
