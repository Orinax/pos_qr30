import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";
import { useState, Component, onWillDestroy } from "@odoo/owl";

const { DateTime } = luxon;

export class CustomerDisplayQRPopup extends Component {
  static template = "pos_qr30_scb.CustomerDisplayQRPopup";
  static components = { Dialog };
  static props = {
    qrCode: [String, Object],
    shopName: String,
    amount: String,
    expireTime: { type: [Date, String] },
  };

  static defaultProps = {
    title: _t("Mobile Banking"),
  };

  setup() {
    this.body = _t("Please scan the QR code with %s", this.props.title);

    const expireTime = this.props.expireTime;
    this.expireTime =
      expireTime instanceof Date
        ? DateTime.fromJSDate(expireTime)
        : DateTime.fromISO(expireTime);

    this.state = useState({
      secondBeforeExpire: 600,
    });

    this.update = setInterval(() => {
      this.countdown();
    }, 1000);

    onWillDestroy(() => clearInterval(this.update));
  }

  get qrCodeSrc() {
    const qrCode = this.props.qrCode;
    if (typeof qrCode === "string") return qrCode;
    if (qrCode && typeof qrCode === "object") {
      const raw = qrCode.qrImage || qrCode.image || qrCode.data || "";
      if (raw && !raw.startsWith("data:")) {
        return `data:image/png;base64,${raw}`;
      }
      return raw;
    }
    return "";
  }

  countdown() {
    this.state.secondBeforeExpire = Math.round(
      this.expireTime.diffNow("seconds").seconds
    );
    if (this.state.secondBeforeExpire <= 0) {
      this.props.close();
    }
  }
}
