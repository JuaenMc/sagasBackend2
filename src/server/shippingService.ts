import { Order, ShippingLabel } from '../types/database';
import { EMITTER_INFO } from './nfeService';

/**
 * Gera código de rastreamento no padrão dos Correios / Transportadoras brasileiras
 * Exemplo: BR 839 201 482 SG (SG = SAGAS / Sedex)
 */
export function generateTrackingCode(carrier: string): string {
  const num = Math.floor(100000000 + Math.random() * 900000000);
  if (carrier.includes('SEDEX')) {
    return `SL${num}BR`;
  } else if (carrier.includes('PAC')) {
    return `PL${num}BR`;
  } else if (carrier.includes('Jadlog')) {
    return `JAD${num}`;
  }
  return `BR${num}SG`;
}

/**
 * Gera etiqueta de envio para o pedido
 */
export function createShippingLabelForOrder(
  order: Order,
  nfeNumber?: string,
  nfeKey?: string
): ShippingLabel {
  const carrier = order.shipping_carrier || 'Correios SEDEX';
  const trackingCode = order.tracking_code || generateTrackingCode(carrier);
  const totalWeight = order.items.reduce((acc, item) => acc + (0.28 * item.quantity), 0.15); // peso estimado

  return {
    id: `lbl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    order_id: order.id,
    order_number: order.order_number,
    tracking_code: trackingCode,
    carrier: carrier,
    service_type: carrier.includes('SEDEX') ? 'SEDEX CONTRATO' : 'PAC CONTRATO',
    status: 'PENDENTE',
    sender: {
      name: EMITTER_INFO.trade_name,
      company: EMITTER_INFO.name,
      address: EMITTER_INFO.address,
      city: EMITTER_INFO.city,
      state: EMITTER_INFO.state,
      zip: EMITTER_INFO.zip,
    },
    recipient: {
      name: order.customer.name,
      address: order.customer.address,
      city: order.customer.city,
      state: order.customer.state,
      zip: order.customer.zip_code,
      phone: order.customer.phone,
    },
    package: {
      weight_kg: Number(totalWeight.toFixed(2)),
      format: 'Pacote / Caixa',
      length_cm: 26,
      width_cm: 20,
      height_cm: 8,
      items_summary: order.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      declared_value: order.total,
      nfe_number: nfeNumber || order.nfe_number,
      nfe_key: nfeKey || order.nfe_key,
    },
    barcode_128: trackingCode,
    dispatch_date: new Date().toISOString().split('T')[0],
  };
}
