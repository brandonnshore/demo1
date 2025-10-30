// Google Analytics 4 Event Tracking

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Track page views (automatically handled by GA4, but can be called manually for SPA navigation)
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

// Track when user starts customizing a product
export const trackCustomizationStarted = (productName: string) => {
  if (window.gtag) {
    window.gtag('event', 'begin_customization', {
      item_name: productName,
    });
  }
};

// Track when user saves a design
export const trackDesignSaved = (designName: string) => {
  if (window.gtag) {
    window.gtag('event', 'save_design', {
      design_name: designName,
    });
  }
};

// Track when user views cart
export const trackViewCart = (cartValue: number, itemCount: number) => {
  if (window.gtag) {
    window.gtag('event', 'view_cart', {
      currency: 'USD',
      value: cartValue,
      items: itemCount,
    });
  }
};

// Track when user begins checkout
export const trackBeginCheckout = (cartValue: number, items: any[]) => {
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: cartValue,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

// Track successful purchase (most important for ads!)
export const trackPurchase = (
  orderId: string,
  total: number,
  items: any[]
) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'USD',
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

// Track when user adds payment info
export const trackAddPaymentInfo = () => {
  if (window.gtag) {
    window.gtag('event', 'add_payment_info');
  }
};

// Track when user clicks on product
export const trackSelectItem = (productName: string, productId: string) => {
  if (window.gtag) {
    window.gtag('event', 'select_item', {
      item_list_name: 'Products',
      items: [
        {
          item_id: productId,
          item_name: productName,
        },
      ],
    });
  }
};
