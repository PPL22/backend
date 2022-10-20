const {
  searchMahasiswa,
  getDataAkademikMhs,
  getCountStatusDataAkademikMhs
} = require('../services/dataMahasiswaServices');
const {
  validasiDataIrs,
  validasiDataKhs,
  validasiDataPkl,
  validasiDataSkripsi,
  getStatusValidasiIRS,
  getStatusValidasiKHS,
  getStatusValidasiPKL,
  getStatusValidasiSkripsi,
} = require('../services/dosenServices');

const {
  rekapStatusMahasiswa,
  daftarStatusMahasiswa,
  rekapPklMahasiswa,
  daftarPklMahasiswa,
  rekapSkripsiMahasiswa,
  daftarSkripsiMahasiswa,
} = require('../services/rekapServices')

// Dashboard
const getDashboardDosenController = async (req, res) => {
  const nip = req.id
  if (!nip) {
    return res.status(400).json({
      message: "ID kosong"
    })
  }

  try {
    const data = {nip}
    const result = await getCountStatusDataAkademikMhs(data);

    return res.status(200).json({
      message: "Data dashboard berhasil diretrieve",
      data: result
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}

// Get status validasi
const getStatusValidasiController = async (req, res) => {
  const nip = req.id
  const path = req.path

  if (!nip) {
    return res.status(400).json({
      message: "ID kosong"
    })
  }
  try {
    const data = { nip }
    let result = null
    switch (path) {
      case "/dosen/status-validasi/irs":
        result = await getStatusValidasiIRS(data); 
        break;
      case "/dosen/status-validasi/khs":
        result = await getStatusValidasiKHS(data); 
        break;
      case "/dosen/status-validasi/pkl":
        result = await getStatusValidasiPKL(data); 
        break;
      case "/dosen/status-validasi/skripsi":
        result = await getStatusValidasiSkripsi(data); 
        break; 
    }

    if (!result) return res.status(400).json({
      message: "Failed to retrieve list status validasi"
    })

    return res.status(200).json({
      data: result,
      message: "Daftar status validasi berhasil diambil"
    })
  } catch (err) {
    console.log(err.message)
    return res.status(400).json({
      message: err.message
    })
  }
}

// Validasi data
const validasiDataIrsController = async (req, res) => {
  const {
    nim,
    semester,
    status,
    jumlahSks
  } = req.body;

  // check null input
  if (!nim || !semester || !status || !jumlahSks || !statusValidasi) {
    return res.status(400).json({
      message: "Data tidak boleh kosong",
    });
  }

  try {
    const data = {
      nim,
      semester,
      status,
      jumlahSks
    };

    const result = await validasiDataIrs(data);
    return res.status(200).json({
      message: "validasi data IRS berhasil",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message
    });
  }
};

const validasiDataKhsController = async (req, res) => {
  const {
    nim,
    semester,
    status,
    jumlahSksSemester,
    ips,
    jumlahSKsKumulatif,
    ipk,
  } = req.body;

  // check null input
  if (
    !nim ||
    !semester ||
    !status ||
    !jumlahSksSemester ||
    !ips ||
    !jumlahSKsKumulatif ||
    !ipk
  ) {
    return res.status(400).json({
      message: "Data tidak boleh kosong",
    });
  }

  try {
    const data = {
      nim,
      semester,
      status,
      jumlahSksSemester,
      ips,
      jumlahSKsKumulatif,
      ipk,
    };

    const result = await validasiDataKhs(data);
    return res.status(200).json({
      message: "validasi data KHS berhasil ",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message
    });
  }
};

const validasiDataPklController = async (req, res) => {
  const {
    nim,
    semester,
    nilai,
    tanggalLulusSidang
  } = req.body;

  // check null input
  if (!nim || !semester || !status || !nilai || !tanggalLulusSidang) {
    return res.status(400).json({
      message: "Data tidak boleh kosong",
    });
  }

  try {
    const data = {
      nim,
      semester,
      nilai,
      tanggalLulusSidang,
    };

    const result = await validasiDataPkl(data);
    return res.status(200).json({
      message: "validasi data progress PKL berhasil",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message
    });
  }
};

const validasiDataSkripsiController = async (req, res) => {
  const {
    nim,
    semester,
    status,
    nilai,
    tanggalLulusSidang,
    lamaStudi
  } = req.body;

  // check null input
  if (!nim || !semester || !status || !nilai) {
    return res.status(400).json({
      message: "Data tidak boleh kosong",
    });
  }
  try {
    const data = {
      nim,
      semester,
      status,
      nilai,
      tanggalLulusSidang,
      lamaStudi
    };

    const result = await validasiDataSkripsi(data);
    return res.status(200).json({
      message: "validasi data progress PKL berhasil",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message
    });
  }
};

const rekapMahasiswaDosenController = async (req, res) => {
  const nip = req.id;
  const path = req.path;

  // check null input
  if (!nip) {
    return res.status(400).json({
      message: "NIP tidak boleh kosong",
    });
  }

  try {
    let result;
    if (path === `/dosen/rekap-pkl/${nip}`) {
      result = await rekapPklMahasiswa({
        nip
      });
    } else if (path === `/dosen/rekap-skripsi/${nip}`) {
      result = await rekapSkripsiMahasiswa({
        nip
      });
    } else if (path === `/dosen/rekap-status/${nip}`) {
      result = await rekapStatusMahasiswa({
        nip
      });
    } else {
      return res.status(404).json({
        message: "path tidak ditemukan"
      });
    }
    return res.status(200).json({
      message: "rekap mahasiswa berhasil diambil",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message
    });
  }
};

const daftarMahasiswaDosenController = async (req, res) => {
  const nip = req.id;
  const path = req.path;

  // check null input
  if (!nip) {
    return res.status(400).json({
      message: "NIP tidak boleh kosong",
    });
  }

  try {
    let result;
    if (path === `/dosen/daftar-pkl/${nip}`) {
      result = await daftarPklMahasiswa({
        nip
      });
    } else if (path === `/dosen/daftar-skripsi/${nip}`) {
      result = await daftarSkripsiMahasiswa({
        nip
      });
    } else if (path === `/dosen/daftar-status/${nip}`) {
      result = await daftarStatusMahasiswa({
        nip
      });
    } else {
      return res.status(404).json({
        message: "path tidak ditemukan"
      });
    }
    return res.status(200).json({
      message: "rekap status mahasiswa berhasil diambil",
      data: result,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message
    });
  }
};

const searchMahasiswaDosenController = async (req, res) => {
  // Check if keyword is nim / nama
  const {
    keyword
  } = req.query;
  const nip = req.id;
    
  if (!nip) {
    return res.status(400).json({
      message: "NIP tidak boleh kosong",
    });
  }

  try {
    const result = await searchMahasiswa({
      nip,
      keyword,
    })

    return res.status(200).json({
      message: "search berhasil",
      data: result
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}

// !!! Harus cek nip?
const getDataAkademikMhsDosenController = async (req, res) => {
  const {
    nim
  } = req.params
  const nip = req.id
  try {
    const result = await getDataAkademikMhs({
      nim
    })
    if (result.nipDoswal != nip) {
      return res.status(403).json({
        message: "bukan dosen wali, data mahasiswa tidak dapat diambil"
      })
    }
    return res.status(200).json({
      message: "data mahasiswa berhasil diambil",
      data: result
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
}

module.exports = {
  getDashboardDosenController,
  getStatusValidasiController,

  validasiDataIrsController,
  validasiDataKhsController,
  validasiDataPklController,
  validasiDataSkripsiController,
  
  rekapMahasiswaDosenController,
  daftarMahasiswaDosenController,
  
  searchMahasiswaDosenController,
  getDataAkademikMhsDosenController
};