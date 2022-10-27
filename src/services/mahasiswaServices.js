const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const ResizeFile = require("../utils/resizeFile");
const path = require("path");
const fs = require("fs");
const { getDataAkademikMhs } = require("./dataMahasiswaServices");
const countSemester = require("../utils/countSemester");

const getDashboardMahasiswa = async (data) => {
  const result = await getDataAkademikMhs(data);

  const khs = result.dataAkademik[result.semester].filter(
    (obj) => obj.type === "khs"
  );

  return {
    ipkNow: khs[0].ipk,
    sksNow: khs[0].jumlahSksKumulatif,
    ...result,
  };
};

const getDataRegisterMahasiswa = async (data) => {
  try {
    const result = await prisma.tb_mhs.findUnique({
      where: {
        nim: data.nim,
      },
      select: {
        nama: true,
        nim: true,
        statusAktif: true,
        jalurMasuk: true,
        fk_kodeWali: {
          select: {
            nama: true,
          },
        },
        fk_pemilik_akun_mhs: {
          select: {
            username: true,
            password: true,
          },
        },
      },
    });

    return {
      nama: result.nama,
      nim: result.nim,
      statusAktif: result.statusAktif,
      jalurMasuk: result.jalurMasuk,
      namaWali: result.fk_kodeWali.nama,
      username: result.fk_pemilik_akun_mhs.username,
      password: result.fk_pemilik_akun_mhs.password,
    };
  } catch (error) {
    throw new Error(error);
  }
};

// TODO : filename foto belum dikirim diresponse
const updateDataMahasiswa = async (data) => {
  try {
    if (data.oldUsername !== data.username) {
      const checkUsername = await prisma.tb_akun_mhs.findUnique({
        where: {
          username: data.username,
        },
      });

      if (checkUsername) {
        throw new Error("Username sudah digunakan");
      }
    }

    const kodeProv = data.kodeKab.substring(0, 2);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const imagePath = path.join(__dirname, "../../public/images/foto_mhs/");
    const fileUpload = new ResizeFile(
      imagePath,
      path.extname(data.foto.originalname)
    );
    const fileName = await fileUpload.save(data.foto.buffer);

    const [updateAkun, updateMahasiswa] = await prisma.$transaction([
      prisma.tb_akun_mhs.update({
        where: {
          pemilik: data.nim,
        },
        data: {
          username: data.username,
          password: hashedPassword,
        },
      }),
      prisma.tb_mhs.update({
        where: {
          nim: data.nim,
        },
        data: {
          email: data.email,
          alamat: data.alamat,
          kodeKab: data.kodeKab,
          kodeProv: kodeProv,
          noHP: data.noHP,
          foto: fileName,
        },
      }),
    ]);

    if (!updateAkun || !updateMahasiswa) {
      throw new Error("Terjadi kesalahan, silahkan coba lagi");
    }

    return {
      foto: fileName,
      username: data.username,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const entryDataIrs = async (data) => {
  try {
    const fileName = `irs-${data.nim}-${data.semester}.pdf`;
    fs.renameSync(
      `public/documents/${data.dokumen.originalname}`,
      `public/documents/irs/${fileName}`
    );

    const result = await prisma.tb_irs.create({
      data: {
        nim: data.nim,
        semester: data.semester,
        status: data.status,
        jumlahSks: data.jumlahSks,
        fileIrs: fileName,
      },
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const entryDataKhs = async (data) => {
  try {
    const fileName = `khs-${data.nim}-${data.semester}.pdf`;
    fs.renameSync(
      `public/documents/${data.dokumen.originalname}`,
      `public/documents/khs/${fileName}`
    );

    const result = await prisma.tb_khs.create({
      data: {
        nim: data.nim,
        semester: data.semester,
        status: data.status,
        jumlahSksSemester: data.jumlahSksSemester,
        ips: data.ips,
        jumlahSksKumulatif: data.jumlahSksKumulatif,
        ipk: data.ipk,
        fileKhs: fileName,
      },
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const entryDataPkl = async (data) => {
  try {
    const fileName = `pkl-${data.nim}-${data.semester}.pdf`;
    fs.renameSync(
      `public/documents/${data.dokumen.originalname}`,
      `public/documents/pkl/${fileName}`
    );

    const result = await prisma.tb_pkl.create({
      data: {
        nim: data.nim,
        semester: data.semester,
        status: data.status,
        nilai: data.nilai,
        filePkl: fileName,
      },
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const entryDataSkripsi = async (data) => {
  try {
    const fileName = `skripsi-${data.nim}-${data.semester}.pdf`;
    fs.renameSync(
      `public/documents/${data.dokumen.originalname}`,
      `public/documents/skripsi/${fileName}`
    );

    const result = await prisma.tb_skripsi.create({
      data: {
        nim: data.nim,
        semester: data.semester,
        status: data.status,
        nilai: data.nilai,
        tanggalLulusSidang: new Date(data.tanggalLulusSidang),
        fileSkripsi: fileName,
        lamaStudi: parseInt(data.lamaStudi),
      },
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getProfileMahasiswa = async (data) => {
  try {
    const result = await prisma.tb_mhs.findUnique({
      where: {
        nim: data.nim,
      },
      select: {
        angkatan: true,
        fk_kodeWali: {
          select: {
            nama: true,
            nip: true,
          },
        },
        fk_nim_khs: {
          orderBy: {
            semester: "desc",
          },
          take: 1,
          select: {
            ipk: true,
            jumlahSksKumulatif: true,
          },
        },
        fk_nim_irs: {
          orderBy: {
            semester: "desc",
          },
          take: 1,
          select: {
            semester: true,
            status: true,
          },
        },
        fk_kodeKab: {
          select: {
            namaKab: true,
          },
        },
        fk_kodeProv: {
          select: {
            namaProv: true,
          },
        },
      },
    });

    // spread operator
    const profile = {
      namaDosenWali: result.fk_kodeWali.nama,
      nipDosenWali: result.fk_kodeWali.nip,
      semester: countSemester(result.angkatan),
      status: result.fk_nim_irs.length > 0 ? result.fk_nim_irs[0].status : "-",
      ipk: result.fk_nim_khs.length > 0 ? result.fk_nim_khs[0].ipk : "-",
      jumlahSksKumulatif:
        result.fk_nim_khs.length > 0
          ? result.fk_nim_khs[0].jumlahSksKumulatif
          : "-",
      namaKab: result.fk_kodeKab.namaKab,
      namaProv: result.fk_kodeProv.namaProv,
    };

    return profile;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getDataRegisterMahasiswa,
  updateDataMahasiswa,

  getDashboardMahasiswa,
  entryDataIrs,
  entryDataKhs,
  entryDataPkl,
  entryDataSkripsi,
  getProfileMahasiswa,
};
