export default class CommonsController {
  static apiGetTermsLink(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          link: "https://www.dijinx.com",
        },
        message: "",
      });
    } catch (e) {
      res.status(500).json({ success: false, data: {}, message: e.message });
    }
  }
}
