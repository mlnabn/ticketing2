import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { useFinancialReport } from './useFinancialReport';
import ProblematicAssetModal from './ProblematicAssetModal';
import { motion, useIsPresent, AnimatePresence } from 'framer-motion';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};
const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth <= 768;

export default function ProblematicAssetsReport() {
    const isPresent = useIsPresent();
    const [isMobile, setIsMobile] = useState(isMobileDevice());
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(!isMobileDevice());
    const {
        detailedData,
        filters,
        filterType,
        isLoading,
        handleFilterChange,
        handleFilterTypeChange,
        handleExport,
        formatCurrency,
        formatDate,
        years,
        months
    } = useFinancialReport(isPresent);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        handleFilterChange(e);

        if (name === 'start_date' && value !== '') {
            const currentEndDate = filters.end_date;
            const newStartDateObj = new Date(value);
            const currentEndDateObj = currentEndDate ? new Date(currentEndDate) : null;
            if (currentEndDate === '' || !currentEndDateObj || currentEndDateObj < newStartDateObj) {
                const end_date_event = {
                    target: {
                        name: 'end_date',
                        value: value 
                    }
                };
                handleFilterChange(end_date_event);
            }
        }
        if (name === 'end_date' && filters.start_date && new Date(value) < new Date(filters.start_date)) {
             const start_date_event = {
                target: {
                    name: 'end_date',
                    value: filters.start_date
                }
            };
            handleFilterChange(start_date_event);
        }
    };

    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);

    const problematicAssetsSubtotal = detailedData.problematic_assets.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);
    const handleExportWrapper = async (type) => {
        if (type === 'pdf') setExportingPdf(true);
        else setExportingExcel(true);

        await handleExport(type, 'problematic_assets');

        if (type === 'pdf') setExportingPdf(false);
        else setExportingExcel(false);
    };

    const handleRowClick = (e, item) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.action-buttons-group')) {
            return;
        }
        setSelectedItem(item);
    };

    const filterTypeOptions = useMemo(() => ([
        { value: 'month', label: 'Filter per Bulan' },
        { value: 'date_range', label: 'Filter per Tanggal' },
    ]), []);

    const monthOptions = useMemo(() => ([
        { value: '', label: 'Semua Bulan' },
        ...months.map(m => ({ value: m.value.toString(), label: m.name })),
    ]), [months]);

    const yearOptions = useMemo(() => ([
        { value: '', label: 'Semua Tahun' },
        ...years.map(y => ({ value: y.toString(), label: y.toString() })),
    ]), [years]);

    const handleSelectFilterChange = useCallback((selectedOption, name) => {
        const mockEvent = {
            target: {
                name: name,
                value: selectedOption ? selectedOption.value : '',
            }
        };
        handleFilterChange(mockEvent);
    }, [handleFilterChange]);

    const handleSelectFilterTypeChange = useCallback((selectedOption) => {
        const mockEvent = {
            target: {
                value: selectedOption.value,
            }
        };
        handleFilterTypeChange(mockEvent);
    }, [handleFilterTypeChange]);

    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyDesktop = window.innerWidth >= 768;
            setIsMobile(!isCurrentlyDesktop);
            if (isCurrentlyDesktop) {
                setIsMobileFilterOpen(true);
            }
            else {
                setIsMobileFilterOpen(false);
            }
            
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <motion.div
            className="user-management-container"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={staggerItem} className="report-header-controls">
                <h1 className="page-title">Laporan Aset Bermasalah (Rusak/Hilang)</h1>
            </motion.div>

            <motion.button
                variants={staggerItem}
                className="btn-toggle-filters"
                onClick={() => setIsMobileFilterOpen(prev => !prev)}
            >
                <i className={`fas ${isMobileFilterOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginRight: '8px' }}></i>
                {isMobileFilterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
            </motion.button>
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <motion.div
                        variants={staggerItem}
                        className="filters-container"
                    >
                        <motion.div
                            key="mobile-filters-content"
                            initial={isMobile ? "closed" : false}
                            animate="open"
                            exit="closed"
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 25
                            }}
                            variants={{
                                closed: { height: 0, opacity: 0, overflow: 'hidden', marginTop: 0, marginBottom: 0 },
                                open: { height: 'auto', opacity: 1, overflow: 'visible', marginTop: '0.75rem', marginBottom: '0.75rem' }
                            }}
                            className="filters-content-wrapper"
                        >

                            <Select
                                classNamePrefix="report-filter-select"
                                options={filterTypeOptions}
                                value={filterTypeOptions.find(opt => opt.value === filterType)}
                                onChange={handleSelectFilterTypeChange}
                                isSearchable={false}
                                placeholder="Filter Laporan"
                                menuPortalTarget={document.body}
                                styles={{
                                    container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                            />

                            {filterType === 'month' && (
                                <>
                                    <Select
                                        classNamePrefix="report-filter-select"
                                        name="month"
                                        options={monthOptions}
                                        value={monthOptions.find(m => m.value === filters.month)}
                                        onChange={(selectedOption) => handleSelectFilterChange(selectedOption, 'month')}
                                        placeholder="Semua Bulan"
                                        isSearchable={false}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                        }}
                                    />
                                    <Select
                                        classNamePrefix="report-filter-select"
                                        name="year"
                                        options={yearOptions}
                                        value={yearOptions.find(y => y.value === filters.year)}
                                        onChange={(selectedOption) => handleSelectFilterChange(selectedOption, 'year')}
                                        placeholder="Semua Tahun"
                                        isSearchable={false}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                        }}
                                    />
                                </>
                            )}
                            {filterType === 'date_range' && (
                                <motion.div
                                    variants={staggerItem}
                                    className='date-range-container'
                                >
                                    <input type="date" name="start_date" value={filters.start_date} onChange={handleDateChange} className="filter-select-date" style={{ flex: 1 }} />
                                    <span style={{ alignSelf: 'center' }}>-</span>
                                    <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-date" style={{ flex: 1 }} min={filters.start_date || undefined}/>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={staggerItem} className="download-buttons">
                <button onClick={() => handleExportWrapper('excel')} disabled={exportingExcel} className="btn-download excel">
                    <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                    {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                </button>
                <button onClick={() => handleExportWrapper('pdf')} disabled={exportingPdf} className="btn-download pdf">
                    <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                    {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                </button>
            </motion.div>


            <motion.div variants={staggerItem} className="job-list-container">
                {/* Desktop View */}
                <div className="table-scroll-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Tanggal Kejadian</th>
                                <th>Status</th>
                                <th>Kode SKU</th>
                                <th>Nama Barang</th>
                                <th>PJ/Lokasi</th>
                                <th style={{ textAlign: 'right' }}>Nilai Aset</th>
                            </tr>
                        </thead>
                    </table>
                    <div className="table-body-scroll">
                        <table className="job-table">
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                ) : detailedData.problematic_assets.length > 0 ? (
                                    <>
                                        {detailedData.problematic_assets.map(item => (
                                            <tr key={`prob-${item.kode_unik}`} className="hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                                <td>{formatDate(item.tanggal_hilang || item.tanggal_rusak)}</td>
                                                <td>
                                                    <span className={`badge-status status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {item.status_detail?.nama_status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>{item.kode_unik}</td>
                                                <td>{item.master_barang.nama_barang}</td>
                                                <td>{item.user_penghilang?.name || item.user_perusak?.name || item.workshop?.name || '-'}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.harga_beli))}</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada aset bermasalah pada periode ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {detailedData.problematic_assets.length > 0 && (
                        <table className="job-table">
                            <tfoot><tr className="subtotal-row loss-row">
                                <td colSpan="5">Subtotal Potensi Kerugian</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    ({formatCurrency(problematicAssetsSubtotal)})
                                </td>
                            </tr></tfoot>
                        </table>
                    )}
                </div>

                {/* Mobile View  */}
                <div
                    className='job-list-mobile'
                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                >
                    {isLoading ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Memuat data...</p>
                        </div>
                    ) : detailedData.problematic_assets.length > 0 ? (
                        <>
                            {detailedData.problematic_assets.map(item => (
                                <div key={`mobile-prob-${item.kode_unik}`} className="ticket-card-mobile hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">Nama Barang</span>
                                            <span className="value description">
                                                {item.master_barang.nama_barang}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">Kode SKU</span>
                                            <span className="value">{item.kode_unik}</span>
                                        </div>
                                        <div className="data-group">
                                            <span className="label">Status</span>
                                            <span className="value">
                                                <span className={`status-badge status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {item.status_detail?.nama_status || 'N/A'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">Tanggal Kejadian</span>
                                            <span className="value">{formatDate(item.tanggal_hilang || item.tanggal_rusak)}</span>
                                        </div>
                                        <div className="data-group">
                                            <span className="label">PJ/Lokasi</span>
                                            <span className="value">{item.user_penghilang?.name || item.user_perusak?.name || item.workshop?.name || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="card-row value-row-financial">
                                        <div className="data-group single" style={{ textAlign: 'right' }}>
                                            <span className="label">Nilai Aset</span>
                                            <span className="value value-loss">
                                                ({formatCurrency(parseFloat(item.harga_beli))})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}


                        </>
                    ) : (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada aset bermasalah pada periode ini.</p>
                        </div>
                    )}
                </div>
                <div className='job-list-mobile'>
                    <div className="subtotal-card-mobile" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Subtotal Potensi Kerugian</span>
                        <span className="subtotal-value value-loss" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                            ({formatCurrency(problematicAssetsSubtotal)})
                        </span>
                    </div>
                </div>
            </motion.div>
            <ProblematicAssetModal
                show={Boolean(selectedItem)}
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />
        </motion.div>
    );
}