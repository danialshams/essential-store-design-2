"use client";

import Link from "next/link";
import {ArrowLeft, Instagram, Mail, MapPin, Phone} from "lucide-react";
import {useShop} from "@/components/ShopProvider";

export function Footer(){
  const {store}=useShop();
  return <footer className="premium-footer">
    <div className="premium-footer-top premium-container">
      <div className="premium-footer-story">
        <span className="premium-eyebrow">THE WAY WE SEE STYLE</span>
        <h2>سلیقه، در انتخاب‌های کوچک<br/><i>معنا پیدا می‌کند.</i></h2>
        <Link href="/info/about" className="premium-footer-discover">قصه ما را بخوانید <ArrowLeft size={18}/></Link>
      </div>
      <div className="premium-footer-links">
        <div><h3>راهنمای خرید</h3><Link href="/products">همه محصولات</Link><Link href="/cart">سبد خرید</Link><Link href="/account">حساب من</Link><Link href="/info/shipping">ارسال و مرجوعی</Link><Link href="/info/faq">سوالات متداول</Link></div>
        <div><h3>درباره فروشگاه</h3><Link href="/info/about">داستان ما</Link><Link href="/blog">ژورنال</Link><Link href="/info/contact">ارتباط با ما</Link><Link href="/info/privacy">حریم خصوصی</Link><Link href="/info/terms">قوانین و مقررات</Link></div>
        <div className="premium-footer-contact"><h3>در ارتباط باشیم</h3><span><Phone size={16}/>{store.settings.contactPhone||"شماره تماس هنوز ثبت نشده"}</span><span><Mail size={16}/>{store.settings.contactEmail||"ایمیل هنوز ثبت نشده"}</span><span><MapPin size={16}/>{store.settings.address||"آدرس از پنل مدیریت قابل تنظیم است"}</span>{store.settings.instagram&&<a href={store.settings.instagram.startsWith("https://")?store.settings.instagram:`https://instagram.com/${store.settings.instagram.replace(/^@/,"")}`} rel="noopener noreferrer" target="_blank"><Instagram size={16}/> اینستاگرام</a>}</div>
      </div>
    </div>
    <div className="premium-footer-bottom premium-container">
      <span>© ۱۴۰۵ {store.settings.storeName} — تمامی حقوق محفوظ است.</span>
      <strong>ESSENTIAL — EDITION 02</strong>
      <span>ساخته‌شده با توجه به جزئیات</span>
    </div>
  </footer>
}
