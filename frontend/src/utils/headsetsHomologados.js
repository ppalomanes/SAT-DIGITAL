// Lista de headsets homologados extraída del archivo oficial
export const HEADSETS_HOMOLOGADOS = [
  {
    marca: "Accutone",
    modelo: "WT980 Inalámbrico",
    conector: "Base Inalámbrica"
  },
  {
    marca: "Diqsa",
    modelo: "Audio D02",
    conector: "Plug"
  },
  {
    marca: "Jabra",
    modelo: "Jabra Cord-Supervisor",
    conector: "Plug"
  },
  {
    marca: "Jabra",
    modelo: "Biz 1500 QD Duo",
    conector: "Plug"
  },
  {
    marca: "Jabra",
    modelo: "Ninja",
    conector: "Plug"
  },
  {
    marca: "Noga",
    modelo: "NG-8620",
    conector: "Plug"
  },
  {
    marca: "Plantronics",
    modelo: "326/z",
    conector: "Plug"
  },
  {
    marca: "Plantronics",
    modelo: "Audio 326",
    conector: "Plug"
  },
  {
    marca: "Accutone",
    modelo: "WT880",
    conector: "QD"
  },
  {
    marca: "Jabra",
    modelo: "GN2000 QD mono/duo",
    conector: "RJ9"
  },
  {
    marca: "Jabra",
    modelo: "Biz 1900 Duo",
    conector: "RJ9"
  },
  {
    marca: "Accutone",
    modelo: "PWM710",
    conector: "USB"
  },
  {
    marca: "Accutone",
    modelo: "M1000",
    conector: "USB"
  },
  {
    marca: "Accutone",
    modelo: "E-USBM610 - Monoauricular",
    conector: "USB"
  },
  {
    marca: "Accutone",
    modelo: "E-USBB610 - Biauricular",
    conector: "USB"
  },
  {
    marca: "Diqsa",
    modelo: "D02U",
    conector: "USB"
  },
  {
    marca: "Eurocase",
    modelo: "Sparta UEHP-103",
    conector: "USB"
  },
  {
    marca: "Jabra",
    modelo: "Biz 2300 Duo",
    conector: "USB"
  },
  {
    marca: "Jabra",
    modelo: "Ninja Duo USB",
    conector: "USB"
  },
  {
    marca: "Jabra",
    modelo: "Jabra BIZ 1500 Duo USB",
    conector: "USB"
  },
  {
    marca: "Jabra",
    modelo: "UC Voice 150 Duo",
    conector: "USB"
  },
  {
    marca: "Jabra",
    modelo: "Biz 1100 Duo",
    conector: "USB"
  },
  {
    marca: "Logitech",
    modelo: "H340",
    conector: "USB"
  },
  {
    marca: "Logitech",
    modelo: "H390",
    conector: "USB"
  },
  {
    marca: "Logitech",
    modelo: "Logitech USB Headset H330",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "SupraElite USB AH450",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "Plantronics audio 628 USB",
    conector: "USB"
  },
  {
    marca: "IMICRO",
    modelo: "SP-IMME282",
    conector: "USB"
  },
  {
    marca: "Jabra",
    modelo: "PRO 930 Duo",
    conector: "Wireless"
  },
  {
    marca: "Plantronics",
    modelo: "HW251",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "HW261",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "HW510v",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "HW520v",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "C3210",
    conector: "USB"
  },
  {
    marca: "Plantronics",
    modelo: "C3220",
    conector: "USB"
  }
];

export const MARCAS_HEADSETS_HOMOLOGADAS = [
  "Accutone",
  "Diqsa",
  "Jabra",
  "Noga",
  "Plantronics",
  "Eurocase",
  "Logitech",
  "IMICRO"
];

export const validarHeadsetHomologado = (marcaHeadset, modeloHeadset) => {
  if (!marcaHeadset || !modeloHeadset) return false;
  
  const marcaNormalizada = marcaHeadset.toLowerCase().trim();
  const modeloNormalizado = modeloHeadset.toLowerCase().trim();
  
  return HEADSETS_HOMOLOGADOS.some(headset => {
    const marcaHomologada = headset.marca.toLowerCase().trim();
    const modeloHomologado = headset.modelo.toLowerCase().trim();
    
    // Verificación exacta o parcial
    return marcaNormalizada.includes(marcaHomologada) || marcaHomologada.includes(marcaNormalizada) ||
           modeloNormalizado.includes(modeloHomologado) || modeloHomologado.includes(modeloNormalizado);
  });
};
