const {
  rekapStatusMahasiswa,
  daftarStatusMahasiswa,
  rekapPklMahasiswa,
  daftarPklMahasiswa,
  rekapSkripsiMahasiswa,
  daftarSkripsiMahasiswa,
} = require('../services/rekapServices')

const rekapMahasiswaDepartemenController = async (req, res) => {
  const path = req.path;

  try {
    let result;
    if (path === "/departemen/rekap-pkl") {
      result = await rekapPklMahasiswa();
    } else if (path === "/departemen/rekap-skripsi") {
      result = await rekapSkripsiMahasiswa();
    } else if (path === "/departemen/rekap-status") {
      result = await rekapStatusMahasiswa();
    } else {
      return res.status(404).json({ message: "path tidak ditemukan" });
    }
    return res.status(200).json({
      message: "rekap mahasiswa berhasil diambil",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const daftarMahasiswaDepartemenController = async (req, res) => {
  const path = req.path;

  try {
    let result;
    if (path === "/departemen/daftar-pkl") {
      result = await daftarPklMahasiswa();
    } else if (path === "/departemen/daftar-skripsi") {
      result = await daftarSkripsiMahasiswa();
    } else if (path === "/departemen/daftar-status") {
      result = await daftarStatusMahasiswa();
    } else {
      return res.status(404).json({ message: "path tidak ditemukan" });
    }
    return res.status(200).json({
      message: "rekap status mahasiswa berhasil diambil",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = {
  rekapMahasiswaDepartemenController,
  daftarMahasiswaDepartemenController,
};
