-- ============================================================
-- Digital Travel ERP - Oracle DDL
-- Sinh tu skill  : oracle-create-table
-- Nguon logic    : docs_source/motaDatabase.md
-- Naming mode    : logical-name (PascalCase Vietnamese business cols)
-- Audit columns  : none
-- Cap nhat       : 2026-04-02
-- ============================================================

-- ------------------------------------------------------------
-- DROP TABLE (thu tu nguoc phu thuoc FK)
-- ------------------------------------------------------------
BEGIN
    FOR t IN (
        SELECT table_name FROM user_tables
        WHERE table_name IN (
                             'DANHGIAKH','YEUCAUHOTRO','NHATKYDOIDIEM','QUYETTOAN',
                             'CHIPHITHUCTE','NHATKYSUCO','HANHDONG','DIEMDANH',
                             'PHANCONGTOUR','LICHSUTOUR','GIAODICH','DATTOUR_UUDAI',
                             'KHUYENMAI_KH','VOUCHER','CHITIETDICHVU','CHITIETDATTOUR',
                             'DSNGUOIDONGHANH','DONDATTOUR','TOURTHUCTE','LICHTRINHTOUR','NANGLUCNHANVIEN',
                              'NHANVIEN','HOCHIEUSO','HANHDONGXANH','DICHVUTHEM',
                              'TOURMAU','NHATKYBAOMAT','NHATKYHETHONG','VAITRO','TAIKHOAN'
            )
        ) LOOP
            EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
        END LOOP;
END;
/

-- ============================================================
-- PHAN HE: DINH DANH VA KHACH HANG
-- ============================================================

-- Danh muc vai tro he thong
CREATE TABLE VAITRO (
                        MaVaiTro         VARCHAR2(50)  PRIMARY KEY,
                        TenHienThi       VARCHAR2(100) NOT NULL
);

-- Tai khoan dang nhap he thong
CREATE TABLE TAIKHOAN (
                          MaTaiKhoan       VARCHAR2(50)  PRIMARY KEY,
                          TenDangNhap      VARCHAR2(100) NOT NULL,
                          MatKhau          VARCHAR2(255) NOT NULL,
                          HoTen            VARCHAR2(200) NOT NULL,
                          SoDinhDanh       VARCHAR2(20),
                          Email            VARCHAR2(200),
                          SoDienThoai      VARCHAR2(20),
                          VaiTro           VARCHAR2(50)  NOT NULL,
                          TrangThai        VARCHAR2(20)  DEFAULT 'HOAT_DONG' NOT NULL,
                          CONSTRAINT UQ_TK_TenDangNhap      UNIQUE (TenDangNhap),
                          CONSTRAINT UQ_TK_Email            UNIQUE (Email),
                          CONSTRAINT UQ_TK_SoDinhDanh       UNIQUE (SoDinhDanh),
                          CONSTRAINT FK_TK_VaiTro           FOREIGN KEY (VaiTro) REFERENCES VAITRO(MaVaiTro),
    CONSTRAINT CK_TAIKHOAN_TTHAI      CHECK (TrangThai IN ('HOAT_DONG','KHOA'))
);


-- Nhat ky he thong: chi ghi nhan thao tac them, cap nhat, xoa
CREATE TABLE NHATKYHETHONG (
                               MaNhatKyHeThong  VARCHAR2(50)   PRIMARY KEY,
                               MaTaiKhoan      VARCHAR2(50),
                               HanhDong        VARCHAR2(100)  NOT NULL,
                               DoiTuong        VARCHAR2(100),
                               MaDoiTuong      VARCHAR2(50),
                               ThoiGian        TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
                               CONSTRAINT FK_NKHT_TaiKhoan FOREIGN KEY (MaTaiKhoan) REFERENCES TAIKHOAN(MaTaiKhoan),
                               CONSTRAINT CK_NKHT_HanhDong CHECK (HanhDong IN ('THEM','CAP_NHAT','XOA'))
);

-- Ho so nghiep vu cua khach hang (1-1 voi TAIKHOAN co VaiTro = KHACHHANG)
CREATE TABLE HOCHIEUSO (
                           MaKhachHang      VARCHAR2(50)   PRIMARY KEY,
                           MaTaiKhoan       VARCHAR2(50)   NOT NULL,
                           CCCD             VARCHAR2(20),
                           SoDienThoai      VARCHAR2(20),
                           GhiChuYTe        CLOB,
                           DiUng            VARCHAR2(1000),
                           HangThanhVien    VARCHAR2(20)   DEFAULT 'THANH_VIEN' NOT NULL,
                           DiemXanh         NUMBER(15)     DEFAULT 0 NOT NULL,
                           CONSTRAINT UQ_HCS_TaiKhoan        UNIQUE (MaTaiKhoan),
                           CONSTRAINT UQ_HCS_CCCD            UNIQUE (CCCD),
                           CONSTRAINT FK_HCS_TaiKhoan        FOREIGN KEY (MaTaiKhoan)   REFERENCES TAIKHOAN(MaTaiKhoan),
                           CONSTRAINT CK_HCS_HangTV          CHECK (HangThanhVien IN ('THANH_VIEN','DONG','BAC','VANG','KIM_CUONG')),
                           CONSTRAINT CK_HCS_DiemXanh        CHECK (DiemXanh >= 0)
);

-- Ho so nhan vien noi bo (1-1 voi TAIKHOAN co VaiTro != KHACHHANG)
CREATE TABLE NHANVIEN (
                          MaNhanVien           VARCHAR2(50) PRIMARY KEY,
                          MaTaiKhoan           VARCHAR2(50) NOT NULL,
                          LoaiNhanVien         VARCHAR2(50),
                          NgayVaoLam           DATE,
                          TrangThaiLamViec     VARCHAR2(20) DEFAULT 'HOAT_DONG' NOT NULL,
                          CONSTRAINT UQ_NV_TaiKhoan          UNIQUE (MaTaiKhoan),
                          CONSTRAINT FK_NV_TaiKhoan          FOREIGN KEY (MaTaiKhoan)   REFERENCES TAIKHOAN(MaTaiKhoan),
                          CONSTRAINT CK_NV_TrangThai         CHECK (TrangThaiLamViec IN ('HOAT_DONG','BAN','NGHI'))
);

-- Nang luc va chung chi huong dan vien
CREATE TABLE NANGLUCNHANVIEN (
                                 MaNangLucNhanVien    VARCHAR2(50)  PRIMARY KEY,
                                 MaNhanVien           VARCHAR2(50)  NOT NULL,
                                 NgonNgu              VARCHAR2(200),
                                 ChungChi             VARCHAR2(500),
                                 ChuyenMon            VARCHAR2(500),
                                 DanhGia              NUMBER(3,2)   DEFAULT 0,
                                 SoDanhGia            NUMBER(10)    DEFAULT 0,
                                 CONSTRAINT FK_NLNV_NhanVien        FOREIGN KEY (MaNhanVien)   REFERENCES NHANVIEN(MaNhanVien),
                                 CONSTRAINT CK_NLNV_DanhGia         CHECK (DanhGia BETWEEN 0 AND 5),
                                 CONSTRAINT CK_NLNV_SoDanhGia       CHECK (SoDanhGia >= 0)
);

-- ============================================================
-- PHAN HE: SAN PHAM
-- ============================================================

-- Dinh nghia san pham tour mau
CREATE TABLE TOURMAU (
                         MaTourMau        VARCHAR2(50)  PRIMARY KEY,
                         TieuDe           VARCHAR2(500) NOT NULL,
                         MoTa             CLOB,
                         ThoiLuong        NUMBER(5)     NOT NULL,
                         GiaSan           NUMBER(18,2)  NOT NULL,
                         DanhGia          NUMBER(3,2)   DEFAULT 0,
                         SoDanhGia        NUMBER(10)    DEFAULT 0,
                         CONSTRAINT CK_TOURMAU_ThoiLuong    CHECK (ThoiLuong > 0),
                         CONSTRAINT CK_TOURMAU_GiaSan       CHECK (GiaSan >= 0),
                         CONSTRAINT CK_TOURMAU_DanhGia      CHECK (DanhGia BETWEEN 0 AND 5),
                         CONSTRAINT CK_TOURMAU_SoDanhGia    CHECK (SoDanhGia >= 0)
);

-- Lich trinh tung ngay cua tour mau
CREATE TABLE LICHTRINHTOUR (
                               MaLichTrinhTour  VARCHAR2(50)    PRIMARY KEY,
                               MaTourMau        VARCHAR2(50)    NOT NULL,
                               NgayThu          NUMBER(3)       NOT NULL,
                               HoatDong         VARCHAR2(1000),
                               MoTa             CLOB,
                               ThucDon          VARCHAR2(1000),
                               CONSTRAINT FK_LTT_TourMau              FOREIGN KEY (MaTourMau)   REFERENCES TOURMAU(MaTourMau),
                               CONSTRAINT CK_LICHTRINHTOUR_NgayThu    CHECK (NgayThu > 0)
);

-- Danh muc dich vu bo sung, bao gom phu thu phong
CREATE TABLE DICHVUTHEM (
                            MaDichVuThem     VARCHAR2(50)  PRIMARY KEY,
                            Ten              VARCHAR2(200) NOT NULL,
                            DonViTinh        VARCHAR2(100),
                            DonGia           NUMBER(18,2)  NOT NULL,
                            CONSTRAINT CK_DICHVUTHEM_DonGia      CHECK (DonGia >= 0)
);

-- Danh muc hanh dong xanh duoc cong diem loyalty
CREATE TABLE HANHDONGXANH (
                              MaHanhDongXanh   VARCHAR2(50)  PRIMARY KEY,
                              TenHanhDong      VARCHAR2(200) NOT NULL,
                              DiemCong         NUMBER(10)    NOT NULL,
                              CONSTRAINT CK_HANHDONGXANH_DiemCong    CHECK (DiemCong >= 0)
);

-- Dot khoi hanh cu specific duoc tao tu tour mau
CREATE TABLE TOURTHUCTE (
                            MaTourThucTe         VARCHAR2(50) PRIMARY KEY,
                            MaTourMau            VARCHAR2(50) NOT NULL,
                            NgayKhoiHanh         DATE         NOT NULL,
                            GiaHienHanh          NUMBER(18,2) NOT NULL,
                            SoKhachToiDa         NUMBER(5)    NOT NULL,
                            SoKhachToiThieu      NUMBER(5)    DEFAULT 1 NOT NULL,
                            ChoConLai            NUMBER(5)    NOT NULL,
                            TrangThai            VARCHAR2(20) DEFAULT 'CHO_KICH_HOAT' NOT NULL,
                            CONSTRAINT FK_TTT_TourMau              FOREIGN KEY (MaTourMau)   REFERENCES TOURMAU(MaTourMau),
                            CONSTRAINT CK_TTT_GiaHienHanh          CHECK (GiaHienHanh >= 0),
                            CONSTRAINT CK_TTT_SoKhach              CHECK (SoKhachToiDa >= SoKhachToiThieu AND SoKhachToiThieu > 0),
                            CONSTRAINT CK_TTT_ChoConLai            CHECK (ChoConLai >= 0 AND ChoConLai <= SoKhachToiDa),
                            CONSTRAINT CK_TTT_TrangThai            CHECK (TrangThai IN (
                                                                                        'CHO_KICH_HOAT','MO_BAN','SAP_DIEN_RA','DANG_DIEN_RA',
                                                                                        'KET_THUC','HUY','DA_QUYET_TOAN'
                                ))
);

-- ============================================================
-- PHAN HE: DAT TOUR VA THANH TOAN
-- ============================================================

-- Don dat tour cua khach hang
CREATE TABLE DONDATTOUR (
                            MaDatTour        VARCHAR2(50)  PRIMARY KEY,
                            MaTourThucTe     VARCHAR2(50)  NOT NULL,
                            MaKhachHang      VARCHAR2(50)  NOT NULL,
                            NgayDat          TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                            TongTien         NUMBER(18,2)  NOT NULL,
                            TrangThai        VARCHAR2(30)  DEFAULT 'CHO_XAC_NHAN' NOT NULL,
                            ThoiGianHetHan   TIMESTAMP,
                            GhiChu           VARCHAR2(2000),
                            CONSTRAINT FK_DDT_TourThucTe           FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                            CONSTRAINT FK_DDT_KhachHang            FOREIGN KEY (MaKhachHang)  REFERENCES HOCHIEUSO(MaKhachHang),
                            CONSTRAINT CK_DDT_TongTien             CHECK (TongTien >= 0),
                            CONSTRAINT CK_DDT_TrangThai            CHECK (TrangThai IN (
                                                                                        'CHO_XAC_NHAN','DA_XAC_NHAN','DA_HUY','HET_HAN_GIU_CHO',
                                                                                        'CHO_HUY','THANH_TOAN_THAT_BAI'
                                ))
);

-- Danh sach nguoi dong hanh khong co tai khoan/ho chieu so
CREATE TABLE DSNGUOIDONGHANH (
                               MaNguoiDongHanh  VARCHAR2(50)  PRIMARY KEY,
                               MaDatTour        VARCHAR2(50)  NOT NULL,
                               HoTen            VARCHAR2(200) NOT NULL,
                               CCCD             VARCHAR2(20),
                               SoDienThoai      VARCHAR2(20),
                               NgaySinh         DATE,
                               GioiTinh         VARCHAR2(20),
                               GhiChu           VARCHAR2(1000),
                               CONSTRAINT UQ_DSNDH_DatTour_Nguoi      UNIQUE (MaDatTour, MaNguoiDongHanh),
                               CONSTRAINT FK_DSNDH_DatTour            FOREIGN KEY (MaDatTour) REFERENCES DONDATTOUR(MaDatTour)
);

-- Danh sach hanh khach trong 1 don dat (moi hang = 1 nguoi)
CREATE TABLE CHITIETDATTOUR (
                                MaChiTietDat         VARCHAR2(50) PRIMARY KEY,
                                MaDatTour            VARCHAR2(50) NOT NULL,
                                MaKhachHang          VARCHAR2(50),
                                MaNguoiDongHanh      VARCHAR2(50),
                                LoaiKhach            VARCHAR2(30) DEFAULT 'NGUOI_DAT' NOT NULL,
                                GiaTaiThoiDiemDat    NUMBER(18,2) NOT NULL,
                                CONSTRAINT UQ_CTDT_DatTour_KhachHang  UNIQUE (MaDatTour, MaKhachHang),
                                CONSTRAINT UQ_CTDT_DatTour_NDH        UNIQUE (MaDatTour, MaNguoiDongHanh),
                                CONSTRAINT FK_CTDT_DatTour             FOREIGN KEY (MaDatTour)   REFERENCES DONDATTOUR(MaDatTour),
                                CONSTRAINT FK_CTDT_KhachHang           FOREIGN KEY (MaKhachHang) REFERENCES HOCHIEUSO(MaKhachHang),
                                CONSTRAINT FK_CTDT_NguoiDongHanh       FOREIGN KEY (MaNguoiDongHanh) REFERENCES DSNGUOIDONGHANH(MaNguoiDongHanh),
                                CONSTRAINT FK_CTDT_NDH_DatTour         FOREIGN KEY (MaDatTour, MaNguoiDongHanh) REFERENCES DSNGUOIDONGHANH(MaDatTour, MaNguoiDongHanh),
                                CONSTRAINT CK_CTDT_LoaiKhach           CHECK (LoaiKhach IN ('NGUOI_DAT','NGUOI_DONG_HANH')),
                                CONSTRAINT CK_CTDT_Khach               CHECK (
                                    (MaKhachHang IS NOT NULL AND MaNguoiDongHanh IS NULL AND LoaiKhach = 'NGUOI_DAT') OR
                                    (MaKhachHang IS NULL AND MaNguoiDongHanh IS NOT NULL AND LoaiKhach = 'NGUOI_DONG_HANH')
                                ),
                                CONSTRAINT CK_CTDT_Gia                 CHECK (GiaTaiThoiDiemDat >= 0)
);

-- Dich vu bo sung trong 1 don dat
CREATE TABLE CHITIETDICHVU (
                               MaChiTietDichVu  VARCHAR2(50)  PRIMARY KEY,
                               MaDatTour        VARCHAR2(50)  NOT NULL,
                               MaDichVuThem     VARCHAR2(50)  NOT NULL,
                               SoLuong          NUMBER(10)    NOT NULL,
                               DonGia           NUMBER(18,2)  NOT NULL,
                               ThanhTien        NUMBER(18,2)  NOT NULL,
                               CONSTRAINT FK_CTDV_DatTour             FOREIGN KEY (MaDatTour)    REFERENCES DONDATTOUR(MaDatTour),
                               CONSTRAINT FK_CTDV_DichVuThem          FOREIGN KEY (MaDichVuThem) REFERENCES DICHVUTHEM(MaDichVuThem),
                               CONSTRAINT CK_CTDV_SoLuong             CHECK (SoLuong > 0),
                               CONSTRAINT CK_CTDV_DonGia              CHECK (DonGia >= 0),
                               CONSTRAINT CK_CTDV_ThanhTien           CHECK (ThanhTien >= 0),
                               CONSTRAINT CK_CTDV_ThanhTien_Tinh CHECK (ThanhTien = SoLuong * DonGia)
);

-- Chuong trinh uu dai (voucher master)
CREATE TABLE VOUCHER (
                         MaVoucher            VARCHAR2(50)   PRIMARY KEY,
                         MaCode               VARCHAR2(50)   NOT NULL,
                         LoaiUuDai            VARCHAR2(20)   NOT NULL,
                         GiaTriGiam           NUMBER(18,2)   NOT NULL,
                         DieuKienApDung       VARCHAR2(2000),
                         SoLuotPhatHanh       NUMBER(10)     DEFAULT 1 NOT NULL,
                          SoLuotDaDung         NUMBER(10)     DEFAULT 0 NOT NULL,
                          NgayHieuLuc          DATE           NOT NULL,
                          NgayHetHan           DATE           NOT NULL,
                          TrangThai            VARCHAR2(20)   DEFAULT 'SAN_SANG' NOT NULL,
                          CONSTRAINT UQ_VOUCHER_MaCode           UNIQUE (MaCode),
                          CONSTRAINT CK_VOUCHER_LoaiUuDai        CHECK (LoaiUuDai IN ('PHAN_TRAM','SO_TIEN')),
                          CONSTRAINT CK_VOUCHER_GiaTriGiam       CHECK (GiaTriGiam >= 0),
                          CONSTRAINT CK_VOUCHER_SoLuot           CHECK (SoLuotPhatHanh > 0 AND SoLuotDaDung >= 0),
                          CONSTRAINT CK_VOUCHER_DaDung           CHECK (SoLuotDaDung <= SoLuotPhatHanh),
                          CONSTRAINT CK_VOUCHER_PhanTram         CHECK (LoaiUuDai <> 'PHAN_TRAM' OR GiaTriGiam <= 100),
                          CONSTRAINT CK_VOUCHER_NgayHL           CHECK (NgayHieuLuc <= NgayHetHan),
                          CONSTRAINT CK_VOUCHER_TrangThai        CHECK (TrangThai IN ('SAN_SANG','VO_HIEU_HOA'))
);

-- Vi voucher cua khach hang
CREATE TABLE KHUYENMAI_KH (
                              MaKhachHang      VARCHAR2(50)  NOT NULL,
                              MaVoucher        VARCHAR2(50)  NOT NULL,
                              NgayHetHan       DATE,
                              NgayNhan         TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                              TrangThai        VARCHAR2(20)  DEFAULT 'CO_HIEU_LUC' NOT NULL,
                              CONSTRAINT PK_KHUYENMAIKH              PRIMARY KEY (MaKhachHang, MaVoucher),
                              CONSTRAINT FK_KMKH_KhachHang           FOREIGN KEY (MaKhachHang) REFERENCES HOCHIEUSO(MaKhachHang),
                              CONSTRAINT FK_KMKH_Voucher             FOREIGN KEY (MaVoucher)   REFERENCES VOUCHER(MaVoucher),
                              CONSTRAINT CK_KMKH_TrangThai           CHECK (TrangThai IN ('CO_HIEU_LUC','DA_SU_DUNG','DA_THU_HOI','HET_HAN'))
);

-- Lich su ap dung voucher vao don dat
CREATE TABLE DATTOUR_UUDAI (
                               MaDatTour        VARCHAR2(50)  NOT NULL,
                               MaVoucher        VARCHAR2(50)  NOT NULL,
                               SoTienUuDai      NUMBER(18,2)  NOT NULL,
                               NgayApDung       TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                               CONSTRAINT PK_DATTOUR_UUDAI            PRIMARY KEY (MaDatTour, MaVoucher),
                               CONSTRAINT FK_DTUD_DatTour             FOREIGN KEY (MaDatTour)  REFERENCES DONDATTOUR(MaDatTour),
                               CONSTRAINT FK_DTUD_Voucher             FOREIGN KEY (MaVoucher)  REFERENCES VOUCHER(MaVoucher),
                               CONSTRAINT CK_DTUD_SoTienUD            CHECK (SoTienUuDai >= 0)
);

-- Giao dich thanh toan
CREATE TABLE GIAODICH (
                          MaGiaoDich       VARCHAR2(50)  PRIMARY KEY,
                          MaDatTour        VARCHAR2(50)  NOT NULL,
                          LoaiGiaoDich     VARCHAR2(50)  NOT NULL,
                          PhuongThuc       VARCHAR2(50)  NOT NULL,
                          SoTien           NUMBER(18,2)  NOT NULL,
                          MaGDNH           VARCHAR2(200),
                          TrangThai        VARCHAR2(30)  DEFAULT 'CHO_THANH_TOAN' NOT NULL,
                          NgayThanhToan    TIMESTAMP,
                          CONSTRAINT FK_GIAODICH_DatTour         FOREIGN KEY (MaDatTour)  REFERENCES DONDATTOUR(MaDatTour),
                          CONSTRAINT CK_GIAODICH_LoaiGiaoDich    CHECK (LoaiGiaoDich IN ('THANH_TOAN','HOAN_TIEN')),
                          CONSTRAINT CK_GIAODICH_SoTien          CHECK (SoTien >= 0),
                          CONSTRAINT CK_GIAODICH_TrangThai       CHECK (TrangThai IN (
                                                                                      'CHO_THANH_TOAN','THANH_CONG','THAT_BAI','DA_HOAN_TIEN'
                              ))
);

-- Lich su tham gia tour cua khach
CREATE TABLE LICHSUTOUR (
                            MaLichSuTour     VARCHAR2(50)  PRIMARY KEY,
                            MaKhachHang      VARCHAR2(50)  NOT NULL,
                            MaTourThucTe     VARCHAR2(50)  NOT NULL,
                            MaChiTietDat     VARCHAR2(50),
                            NgayThamGia      DATE,
                            CONSTRAINT UQ_LST_KhachHang_TourThucTe UNIQUE (MaKhachHang, MaTourThucTe),
                            CONSTRAINT FK_LST_KhachHang            FOREIGN KEY (MaKhachHang)  REFERENCES HOCHIEUSO(MaKhachHang),
                            CONSTRAINT FK_LST_TourThucTe           FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                            CONSTRAINT FK_LST_ChiTietDat           FOREIGN KEY (MaChiTietDat) REFERENCES CHITIETDATTOUR(MaChiTietDat)
);

-- ============================================================
-- PHAN HE: VAN HANH VA HIEN TRUONG
-- ============================================================

-- Phan cong HDV theo tour thuc te
CREATE TABLE PHANCONGTOUR (
                              MaPhanCongTour   VARCHAR2(50)  PRIMARY KEY,
                              MaTourThucTe     VARCHAR2(50)  NOT NULL,
                              MaNhanVien       VARCHAR2(50)  NOT NULL,
                              NgayPhanCong     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                              CONSTRAINT UQ_PCT_TourThucTe_NhanVien UNIQUE (MaTourThucTe, MaNhanVien),
                              CONSTRAINT FK_PCT_TourThucTe           FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                              CONSTRAINT FK_PCT_NhanVien             FOREIGN KEY (MaNhanVien)   REFERENCES NHANVIEN(MaNhanVien)
);

-- Nhat ky diem danh khach trong tour
CREATE TABLE DIEMDANH (
                          MaDiemDanh       VARCHAR2(50)  PRIMARY KEY,
                          MaTourThucTe     VARCHAR2(50)  NOT NULL,
                          MaKhachHang      VARCHAR2(50),
                          MaNguoiDongHanh  VARCHAR2(50),
                          LoaiKhach        VARCHAR2(30)  DEFAULT 'NGUOI_DAT' NOT NULL,
                          MaNhanVien       VARCHAR2(50)  NOT NULL,
                          ThoiGian         TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                          DiaDiem          VARCHAR2(500),
                          TrangThai        VARCHAR2(30)  DEFAULT 'CHUA_DIEM_DANH' NOT NULL,
                          CONSTRAINT FK_DIEMDANH_TourThucTe      FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                          CONSTRAINT FK_DIEMDANH_KhachHang       FOREIGN KEY (MaKhachHang)  REFERENCES HOCHIEUSO(MaKhachHang),
                          CONSTRAINT FK_DIEMDANH_NguoiDongHanh   FOREIGN KEY (MaNguoiDongHanh) REFERENCES DSNGUOIDONGHANH(MaNguoiDongHanh),
                          CONSTRAINT FK_DIEMDANH_NhanVien        FOREIGN KEY (MaNhanVien)   REFERENCES NHANVIEN(MaNhanVien),
                          CONSTRAINT FK_DIEMDANH_PhanCong        FOREIGN KEY (MaTourThucTe, MaNhanVien)
                              REFERENCES PHANCONGTOUR(MaTourThucTe, MaNhanVien),
                          CONSTRAINT CK_DIEMDANH_LoaiKhach       CHECK (LoaiKhach IN ('NGUOI_DAT','NGUOI_DONG_HANH')),
                          CONSTRAINT CK_DIEMDANH_Khach           CHECK (
                              (MaKhachHang IS NOT NULL AND MaNguoiDongHanh IS NULL AND LoaiKhach = 'NGUOI_DAT') OR
                              (MaKhachHang IS NULL AND MaNguoiDongHanh IS NOT NULL AND LoaiKhach = 'NGUOI_DONG_HANH')
                          ),
                          CONSTRAINT CK_DIEMDANH_TrangThai       CHECK (TrangThai IN ('DA_DIEM_DANH','CHUA_DIEM_DANH','VANG'))
);

-- Nhat ky xac nhan hanh dong xanh
CREATE TABLE HANHDONG (
                          MaGhiNhanHanhDong    VARCHAR2(50) PRIMARY KEY,
                          MaTourThucTe         VARCHAR2(50) NOT NULL,
                          MaKhachHang          VARCHAR2(50) NOT NULL,
                          MaHanhDongXanh       VARCHAR2(50) NOT NULL,
                          MaNhanVienXacMinh    VARCHAR2(50) NOT NULL,
                          ThoiGian             TIMESTAMP    DEFAULT SYSTIMESTAMP NOT NULL,
                          MinhChung            VARCHAR2(1000),
                          CONSTRAINT FK_HANHDONG_TourThucTe      FOREIGN KEY (MaTourThucTe)      REFERENCES TOURTHUCTE(MaTourThucTe),
                          CONSTRAINT FK_HANHDONG_KhachHang       FOREIGN KEY (MaKhachHang)       REFERENCES HOCHIEUSO(MaKhachHang),
                          CONSTRAINT FK_HANHDONG_HanhDongXanh    FOREIGN KEY (MaHanhDongXanh)    REFERENCES HANHDONGXANH(MaHanhDongXanh),
                          CONSTRAINT FK_HANHDONG_NhanVienXM      FOREIGN KEY (MaNhanVienXacMinh) REFERENCES NHANVIEN(MaNhanVien),
                          CONSTRAINT FK_HANHDONG_PhanCong        FOREIGN KEY (MaTourThucTe, MaNhanVienXacMinh)
                              REFERENCES PHANCONGTOUR(MaTourThucTe, MaNhanVien)
);

-- Nhat ky su co trong tour
CREATE TABLE NHATKYSUCO (
                            MaNhatKySuCo         VARCHAR2(50) PRIMARY KEY,
                            MaTourThucTe         VARCHAR2(50) NOT NULL,
                            MaNhanVienBaoCao     VARCHAR2(50) NOT NULL,
                            MoTa                 CLOB         NOT NULL,
                            GiaiPhap             CLOB,
                            ThoiGianBaoCao       TIMESTAMP    DEFAULT SYSTIMESTAMP NOT NULL,
                            CONSTRAINT FK_NKSC_TourThucTe          FOREIGN KEY (MaTourThucTe)     REFERENCES TOURTHUCTE(MaTourThucTe),
                            CONSTRAINT FK_NKSC_NhanVienBC          FOREIGN KEY (MaNhanVienBaoCao) REFERENCES NHANVIEN(MaNhanVien)
);

-- Chi phi thuc te do HDV khai bao
CREATE TABLE CHIPHITHUCTE (
                              MaChiPhiThucTe   VARCHAR2(50)  PRIMARY KEY,
                              MaTourThucTe     VARCHAR2(50)  NOT NULL,
                              MaNhanVien       VARCHAR2(50)  NOT NULL,
                              DanhMuc          VARCHAR2(200) NOT NULL,
                              ThanhTien        NUMBER(18,2)  NOT NULL,
                              HoaDonAnh        VARCHAR2(1000),
                              TrangThaiDuyet   VARCHAR2(20)  DEFAULT 'CHO_DUYET' NOT NULL,
                              NgayKhai         TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                              CONSTRAINT FK_CPTT_TourThucTe          FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                              CONSTRAINT FK_CPTT_NhanVien            FOREIGN KEY (MaNhanVien)   REFERENCES NHANVIEN(MaNhanVien),
                              CONSTRAINT CK_CPTT_ThanhTien           CHECK (ThanhTien >= 0),
                              CONSTRAINT CK_CPTT_TrangThaiDuyet      CHECK (TrangThaiDuyet IN ('CHO_DUYET','DA_DUYET','TU_CHOI','YEU_CAU_BO_SUNG'))
);

-- ============================================================
-- PHAN HE: TAI CHINH VA HO TRO
-- ============================================================

-- Tong hop quyet toan doanh thu - chi phi theo tour (1-1 voi TOURTHUCTE)
CREATE TABLE QUYETTOAN (
                           MaQuyetToan      VARCHAR2(50)  PRIMARY KEY,
                            MaTourThucTe     VARCHAR2(50)  NOT NULL,
                            TongDoanhThu     NUMBER(18,2)  NOT NULL,
                            TongChiPhi       NUMBER(18,2)  NOT NULL,
                            GiaCamKet        NUMBER(18,2),
                            LoiNhuan         NUMBER(18,2)  NOT NULL,
                           MaNhanVien       VARCHAR2(50)  NOT NULL,
                           NgayQuyetToan    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                           TrangThai        VARCHAR2(20)  DEFAULT 'CHUA_QUYET_TOAN' NOT NULL,
                           GhiChu           CLOB,
                           CONSTRAINT UQ_QUYETTOAN_TourThucTe     UNIQUE (MaTourThucTe),
                           CONSTRAINT FK_QT_TourThucTe            FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                           CONSTRAINT FK_QT_NhanVien              FOREIGN KEY (MaNhanVien)   REFERENCES NHANVIEN(MaNhanVien),
                            CONSTRAINT CK_QT_TongDoanhThu          CHECK (TongDoanhThu >= 0),
                            CONSTRAINT CK_QT_TongChiPhi            CHECK (TongChiPhi >= 0),
                            CONSTRAINT CK_QT_GiaCamKet             CHECK (GiaCamKet IS NULL OR GiaCamKet >= 0),
                            CONSTRAINT CK_QT_TrangThai             CHECK (TrangThai IN ('CHUA_QUYET_TOAN', 'DA_QUYET_TOAN')),
                           CONSTRAINT CK_QT_LoiNhuan CHECK (LoiNhuan = TongDoanhThu - TongChiPhi)
);

-- Nhat ky quy doi diem xanh sang voucher
CREATE TABLE NHATKYDOIDIEM (
                               MaNhatKyDoiDiem  VARCHAR2(50)  PRIMARY KEY,
                               MaKhachHang      VARCHAR2(50)  NOT NULL,
                               MaVoucher        VARCHAR2(50)  NOT NULL,
                               DiemQuyDoi       NUMBER(15)    NOT NULL,
                               NgayQuyDoi       TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
                               CONSTRAINT FK_NKDD_KhachHang           FOREIGN KEY (MaKhachHang) REFERENCES HOCHIEUSO(MaKhachHang),
                               CONSTRAINT FK_NKDD_Voucher             FOREIGN KEY (MaVoucher)   REFERENCES VOUCHER(MaVoucher),
                               CONSTRAINT CK_NKDD_DiemQuyDoi         CHECK (DiemQuyDoi > 0)
);

-- Ticket ho tro / khieu nai cua khach
CREATE TABLE YEUCAUHOTRO (
                             MaYeuCauHoTro    VARCHAR2(50)  PRIMARY KEY,
                             MaDatTour        VARCHAR2(50),
                             MaKhachHang      VARCHAR2(50)  NOT NULL,
                             LoaiYeuCau       VARCHAR2(100) NOT NULL,
                             NoiDung          CLOB          NOT NULL,
                             TrangThai        VARCHAR2(20)  DEFAULT 'CHUA_XU_LY' NOT NULL,
                             MaNhanVienXuLy   VARCHAR2(50),
                             CONSTRAINT FK_YCHT_DatTour             FOREIGN KEY (MaDatTour)      REFERENCES DONDATTOUR(MaDatTour),
                             CONSTRAINT FK_YCHT_KhachHang           FOREIGN KEY (MaKhachHang)    REFERENCES HOCHIEUSO(MaKhachHang),
                             CONSTRAINT FK_YCHT_NhanVienXL          FOREIGN KEY (MaNhanVienXuLy) REFERENCES NHANVIEN(MaNhanVien),
                             CONSTRAINT CK_YCHT_TrangThai           CHECK (TrangThai IN (
                                                                                         'CHUA_XU_LY','CHO_BO_SUNG','CHO_GIAI_TRINH','DA_XU_LY','TU_CHOI'
                                 ))
);

-- Danh gia sau tour cua khach hang
CREATE TABLE DANHGIAKH (
                           MaDanhGiaKhachHang   VARCHAR2(50) PRIMARY KEY,
                           MaTourThucTe         VARCHAR2(50) NOT NULL,
                           MaKhachHang          VARCHAR2(50) NOT NULL,
                           SoSao                NUMBER(1)    NOT NULL,
                           NhanXet              CLOB,
                           NgayDanhGia          TIMESTAMP    DEFAULT SYSTIMESTAMP NOT NULL,
                           CONSTRAINT FK_DGKH_TourThucTe          FOREIGN KEY (MaTourThucTe) REFERENCES TOURTHUCTE(MaTourThucTe),
                           CONSTRAINT FK_DGKH_KhachHang           FOREIGN KEY (MaKhachHang)  REFERENCES HOCHIEUSO(MaKhachHang),
                           CONSTRAINT FK_DGKH_LichSuTour          FOREIGN KEY (MaKhachHang, MaTourThucTe)
                               REFERENCES LICHSUTOUR(MaKhachHang, MaTourThucTe),
                           CONSTRAINT CK_DANHGIAKH_SoSao          CHECK (SoSao BETWEEN 1 AND 5)
);


-- Thêm vào cuối file DDL, sau tất cả CREATE TABLE
CREATE INDEX IDX_DONDATTOUR_KHACHHANG    ON DONDATTOUR(MaKhachHang);
CREATE INDEX IDX_DONDATTOUR_TOURTHUCTE   ON DONDATTOUR(MaTourThucTe);
CREATE INDEX IDX_DONDATTOUR_TRANGTHAI    ON DONDATTOUR(TrangThai);
CREATE INDEX IDX_DSNGUOIDONGHANH_DATTOUR ON DSNGUOIDONGHANH(MaDatTour);
CREATE INDEX IDX_CTDATTOUR_DATTOUR       ON CHITIETDATTOUR(MaDatTour);
CREATE INDEX IDX_CTDICHVU_DATTOUR        ON CHITIETDICHVU(MaDatTour);
CREATE INDEX IDX_GIAODICH_DATTOUR        ON GIAODICH(MaDatTour);
CREATE INDEX IDX_PHANCONGTOUR_NHANVIEN   ON PHANCONGTOUR(MaNhanVien);
CREATE INDEX IDX_LICHSUTOUR_KHACHHANG    ON LICHSUTOUR(MaKhachHang);
CREATE INDEX IDX_HANHDONG_KHACHHANG      ON HANHDONG(MaKhachHang);
CREATE INDEX IDX_DIEMDANH_KHACHHANG      ON DIEMDANH(MaKhachHang);
CREATE INDEX IDX_CHIPHITHUCTE_TOURTT     ON CHIPHITHUCTE(MaTourThucTe);
CREATE INDEX IDX_KMKH_VOUCHER            ON KHUYENMAI_KH(MaVoucher);
CREATE INDEX IDX_NKHT_TAIKHOAN           ON NHATKYHETHONG(MaTaiKhoan);
CREATE INDEX IDX_NKHT_HANHDONG           ON NHATKYHETHONG(HanhDong);
CREATE INDEX IDX_NKHT_DOITUONG           ON NHATKYHETHONG(DoiTuong, MaDoiTuong);
CREATE INDEX IDX_NKHT_THOIGIAN           ON NHATKYHETHONG(ThoiGian);
