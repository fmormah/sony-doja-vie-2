export enum AEService {
  SPOTIFY = "spotify",
}

export interface AppreciationEngineLibrary {
  settings: Settings;
  user: User;
  flow: unknown;
  isEmbed: boolean;
  loggedIn: boolean;
  omniIncluded: boolean;
  events: Events;
  trigger: Triggers;
  get: unknown;
  modal: Modal;
  consentStatus: string;
  cookieconsent: Cookieconsent;
}

export interface Settings {
  mobile_detect: boolean;
  close_button: boolean;
  hide_email_form: boolean;
  extra_fields: unknown;
  extra_fields_screen: string;
  display_error_message: boolean;
  default_flow_handlers: boolean;
  auth_window: boolean;
  activity_sharing_enabled: boolean;
  services?: null;
  scopes?: unknown;
  sso: string;
  language: string;
  extra_info: unknown;
  flow_css?: null;
  verify_email: boolean;
  verify_email_for_login: boolean;
  code?: null;
  show_latest_activity?: null;
  show_latest_activity_for?: null;
  no_email: boolean;
  social_first: boolean;
  refresh_demographics: boolean;
  minimum_age?: null;
  date_format: string;
  profile_link?: null;
  partner_code?: null;
  partner_id?: null;
  help_link?: null;
  apple_music: AppleMusic;
  flow_text: FlowText;
  email_format: EmailFormat;
}

export interface Triggers {
  authenticate: (service: string, type: string, returnUrl: string) => void;
  submit: (form?: unknown) => void;
}

export interface AppleMusic {
  appName?: null;
  icon?: null;
  affiliateToken?: null;
  campaignToken?: null;
}

export interface FlowText {
  error_header: string;
  login_header: string;
  login_button: string;
  login_header_apple: string;
  login_button_apple: string;
  login_with_button: string;
  register_header: string;
  register_button: string;
  register_header_apple: string;
  register_button_apple: string;
  register_with_button: string;
  add_info_header: string;
  add_info_button: string;
  reset_pw_header: string;
  reset_pw_sent: string;
  reset_pw_instructions: string;
  reset_pw_button: string;
  reset_pw_confirm_header: string;
  reset_pw_confirm_button: string;
  reset_pw_confirm_instructions: string;
  reset_pw_done_header: string;
  reset_pw_done_message: string;
  reset_pw_done_button: string;
  verify_email_header: string;
  verify_email_sent: string;
  verify_email_instructions: string;
  verify_email_retry_button: string;
  verify_email_success_header: string;
  verify_email_success_message: string;
  verify_email_success_button: string;
  verify_email_error_header: string;
  verify_email_error_message: string;
  forgot_password_link: string;
  recover_password_link: string;
  optins_title: string;
  have_account_link: string;
  need_help_link: string;
  create_account_link: string;
}

export interface EmailFormat {
  show_header: boolean;
  show_footer: boolean;
  reset_pw_email_subject: string;
  reset_pw_email_message: string;
  reset_pw_email_link: string;
  verify_email_subject: string;
  verify_email_message: string;
  verify_email_link: string;
}

export interface User {
  auth_token?: string;
  data: Data;
  optins?: null[] | null;
  services?: ServicesEntity[] | null;
  jwt: string;
}

export interface Data {
  FirstName: string;
  Email: string;
  Username: string;
  Website: string;
  Gender: string;
  Country: string;
  AccessToken: string;
  ID: number;
  AvatarURL: string;
  City?: null;
  State?: null;
  CountryCode: string;
  GeoCountry: string;
  GeoCity: string;
  GeoRegion: string;
  GeoLat: string;
  GeoLong: string;
  Extended: Extended;
  VerifiedEmail?: null;
}

export interface Extended {
  uuid: string;
}

export interface ServicesEntity {
  Service: string;
  Valid: string;
  ActivitySharing: string;
  ID: string;
  UserID: string;
  Username?: null;
  UserURL: string;
  Token: string;
  TokenSecret: string;
  ServiceID: string;
  LastUpdated: string;
  LastLogin: string;
  VerifiedEmail?: null;
  PaidAccount: string;
  Followers: string;
  Likes: string;
  PartnerCode?: null;
  PartnerID?: null;
  Domains?: string[] | null;
}

export interface Events {
  onFlow: EventHandler;
  onWindow: EventHandler;
  onLogin: EventHandler;
  onLogout: EventHandler;
  onUser: EventHandler;
  onMobileDetect: EventHandler;
  onServiceRemoved: EventHandler;
  onLoaded: EventHandler;
  onEmailVerify: EventHandler;
  onPasswordReset: EventHandler;
  onActivitySharing: EventHandler;
  onActivitySent: EventHandler;
  onOptin: EventHandler;
  onFollow: EventHandler;
}

export interface EventHandler {
  addHandler: (callback: () => void) => void;
  name: string;
}

export interface Modal {
  overlay: OverlayOrWindow;
  window: OverlayOrWindow;
}

export interface OverlayOrWindow {
  0: unknown;
  length: number;
}

export interface Cookieconsent {
  options: Options;
  customStyleSelector: string;
  element: unknown;
  revokeBtn: unknown;
}

export interface Options {
  enabled: boolean;
  container?: null;
  cookie: Cookie;
  content: Content;
  elements: Elements;
  window: string;
  revokeBtn: string;
  compliance: Compliance;
  type: string;
  layouts: Layouts;
  layout: string;
  position: string;
  theme: string;
  static: boolean;
  palette: Palette;
  revokable: boolean;
  animateRevokable: boolean;
  showLink: boolean;
  dismissOnScroll: boolean;
  dismissOnTimeout: boolean;
  autoOpen: boolean;
  autoAttach: boolean;
  whitelistPage?: null[] | null;
  blacklistPage?: null[] | null;
  overrideHTML?: null;
}

export interface Cookie {
  name: string;
  path: string;
  domain: string;
  expiryDays: number;
}

export interface Content {
  header: string;
  message: string;
  dismiss: string;
  allow: string;
  deny: string;
  link: string;
  href: string;
  close: string;
}

export interface Elements {
  header: string;
  message: string;
  messagelink: string;
  dismiss: string;
  allow: string;
  deny: string;
  link: string;
  close: string;
}

export interface Compliance {
  info: string;
  "opt-in": string;
  "opt-out": string;
}

export interface Layouts {
  basic: string;
  "basic-close": string;
  "basic-header": string;
}

export interface Palette {
  popup: Popup;
  button: Button;
}

export interface Popup {
  background: string;
  text: string;
  link: string;
}

export interface Button {
  background: string;
  text: string;
  border: string;
}
