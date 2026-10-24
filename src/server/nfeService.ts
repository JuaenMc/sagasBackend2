import { FiscalInvoice, Order } from '../types/database';

// Dados da Empresa Emitente (SAGAS Brasil Moda e Confecções)
export const EMITTER_INFO = {
  name: 'SAGAS BRASIL MODA FEMININA & INFANTIL LTDA',
  trade_name: 'SAGAS BRASIL',
  cnpj: '34.892.109/0001-45',
  cnpj_raw: '34892109000145',
  ie: '109.842.311.110',
  address: 'Rua José Paulino, 850 - Bom Retiro',
  city: 'São Paulo',
  state: 'SP',
  zip: '01120-000',
  tax_regime: 'Simples Nacional (CRT 1)',
};

/**
 * Calcula o dígito verificador módulo 11 para a chave de 44 dígitos da NF-e
 */
function calculateMod11(keyWithoutDV: string): number {
  let multiplier = 2;
  let sum = 0;
  for (let i = keyWithoutDV.length - 1; i >= 0; i--) {
    sum += parseInt(keyWithoutDV[i], 10) * multiplier;
    multiplier = multiplier === 9 ? 2 : multiplier + 1;
  }
  const remainder = sum % 11;
  return remainder <= 1 ? 0 : 11 - remainder;
}

/**
 * Gera a Chave de Acesso Oficial de 44 dígitos da NF-e
 * Formato: UF (35 - SP) + AAMM + CNPJ (14) + MOD (55) + SÉRIE (001) + NÚMERO (9) + TIPO (1) + CÓDIGO (8) + DV (1)
 */
export function generateNfeAccessKey(nfeSeq: number, date: Date = new Date()): string {
  const uf = '35'; // SP
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const aamm = `${year}${month}`;
  const cnpj = EMITTER_INFO.cnpj_raw;
  const mod = '55'; // NF-e Modelo 55
  const serie = '001';
  const nNF = nfeSeq.toString().padStart(9, '0');
  const tpEmis = '1'; // Emissão normal
  const cNF = Math.floor(10000000 + Math.random() * 90000000).toString(); // Código aleatório 8 dígitos

  const key43 = `${uf}${aamm}${cnpj}${mod}${serie}${nNF}${tpEmis}${cNF}`;
  const dv = calculateMod11(key43);
  return `${key43}${dv}`;
}

/**
 * Gera o XML SEFAZ da NF-e Modelo 55
 */
export function generateNfeXml(order: Order, invoice: FiscalInvoice): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${invoice.access_key}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${invoice.access_key.slice(35, 43)}</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>${invoice.series}</serie>
        <nNF>${parseInt(invoice.nfe_number.replace(/\D/g, ''), 10)}</nNF>
        <dhEmi>${invoice.issue_date}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${invoice.access_key.slice(-1)}</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>2</indPres>
        <procEmi>0</procEmi>
        <verProc>OmniSync-ERP-v2.6</verProc>
      </ide>
      <emit>
        <CNPJ>${EMITTER_INFO.cnpj_raw}</CNPJ>
        <xNome>${EMITTER_INFO.name}</xNome>
        <xFant>${EMITTER_INFO.trade_name}</xFant>
        <enderEmit>
          <xLgr>Rua José Paulino</xLgr>
          <nro>850</nro>
          <xBairro>Bom Retiro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01120000</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderEmit>
        <IE>${EMITTER_INFO.ie.replace(/\D/g, '')}</IE>
        <CRT>1</CRT>
      </emit>
      <dest>
        <CPF>${order.customer.doc_number.replace(/\D/g, '')}</CPF>
        <xNome>${order.customer.name}</xNome>
        <enderDest>
          <xLgr>${order.customer.address}</xLgr>
          <nro>S/N</nro>
          <xBairro>Centro</xBairro>
          <xMun>${order.customer.city}</xMun>
          <UF>${order.customer.state}</UF>
          <CEP>${order.customer.zip_code.replace(/\D/g, '')}</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
        <email>${order.customer.email}</email>
      </dest>
      <det>
${order.items
  .map(
    (item, index) => `        <det nItem="${index + 1}">
          <prod>
            <cProd>${item.sku}</cProd>
            <cEAN>SEM GTIN</cEAN>
            <xProd>${item.name}${item.variation ? ` - ${item.variation}` : ''}</xProd>
            <NCM>${item.ncm.replace(/\D/g, '')}</NCM>
            <CFOP>${item.cfop}</CFOP>
            <uCom>UN</uCom>
            <qCom>${item.quantity.toFixed(4)}</qCom>
            <vUnCom>${item.unit_price.toFixed(4)}</vUnCom>
            <vProd>${item.total_price.toFixed(2)}</vProd>
            <cEANTrib>SEM GTIN</cEANTrib>
            <uTrib>UN</uTrib>
            <qTrib>${item.quantity.toFixed(4)}</qTrib>
            <vUnTrib>${item.unit_price.toFixed(4)}</vUnTrib>
            <indTot>1</indTot>
          </prod>
          <imposto>
            <ICMS>
              <ICMSSN102>
                <orig>0</orig>
                <CSOSN>102</CSOSN>
              </ICMSSN102>
            </ICMS>
          </imposto>
        </det>`
  )
  .join('\n')}
      </det>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>${invoice.totals.vICMS.toFixed(2)}</vICMS>
          <vProd>${invoice.totals.vProd.toFixed(2)}</vProd>
          <vFrete>${invoice.totals.vFrete.toFixed(2)}</vFrete>
          <vDesc>${invoice.totals.vDesc.toFixed(2)}</vDesc>
          <vNF>${invoice.totals.vNF.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <xNome>${order.shipping_carrier}</xNome>
        </transporta>
      </transp>
      <infAdic>
        <infCpl>DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NÃO GERA DIREITO A CRÉDITO FISCAL DE IPI. Pedido de Origem: ${order.order_number} (${order.channel}).</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V400</verAplic>
      <chNFe>${invoice.access_key}</chNFe>
      <dhRecbto>${invoice.issue_date}</dhRecbto>
      <nProt>1352600${Math.floor(1000000 + Math.random() * 9000000)}</nProt>
      <digVal>zF9+D9yQvK3K9J2bLz=</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
}

/**
 * Cria a fatura fiscal para um pedido aprovado
 */
export function createFiscalInvoiceForOrder(order: Order, nextNfeNumber: number): FiscalInvoice {
  const issueDate = new Date().toISOString();
  const accessKey = generateNfeAccessKey(nextNfeNumber);
  const formattedNfeNumber = nextNfeNumber.toString().padStart(6, '0');

  const invoice: FiscalInvoice = {
    id: `nfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    order_id: order.id,
    order_number: order.order_number,
    nfe_number: formattedNfeNumber,
    series: '1',
    access_key: accessKey,
    issue_date: issueDate,
    status: 'AUTORIZADA',
    emitter: {
      name: EMITTER_INFO.name,
      trade_name: EMITTER_INFO.trade_name,
      cnpj: EMITTER_INFO.cnpj,
      ie: EMITTER_INFO.ie,
      address: EMITTER_INFO.address,
      city: EMITTER_INFO.city,
      state: EMITTER_INFO.state,
      zip: EMITTER_INFO.zip,
      tax_regime: EMITTER_INFO.tax_regime,
    },
    recipient: {
      name: order.customer.name,
      cpf_cnpj: order.customer.doc_number,
      email: order.customer.email,
      phone: order.customer.phone,
      address: order.customer.address,
      city: order.customer.city,
      state: order.customer.state,
      zip: order.customer.zip_code,
    },
    totals: {
      vProd: order.subtotal,
      vFrete: order.shipping_cost,
      vDesc: order.discount,
      vNF: order.total,
      vICMS: Number((order.total * 0.04).toFixed(2)), // Alíquota média simples
      vPIS: 0.0,
      vCOFINS: 0.0,
    },
    items: order.items.map((item, index) => ({
      item: index + 1,
      sku: item.sku,
      description: `${item.name}${item.variation ? ` - ${item.variation}` : ''}`,
      ncm: item.ncm,
      cfop: item.cfop,
      uCom: 'UN',
      qCom: item.quantity,
      vUnCom: item.unit_price,
      vProd: item.total_price,
    })),
    xml_string: '',
  };

  invoice.xml_string = generateNfeXml(order, invoice);
  return invoice;
}
