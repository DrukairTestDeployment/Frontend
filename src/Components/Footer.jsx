import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';


import "./footer.css"

const DrukairkFooter = () => {
    return (
        <footer className="drukairkFooter">
            <div className="drukairkFooter__container">
                <div className="drukairkFooter__section">
                    <h3 className="drukairkFooter__sectionTitle">ABOUT US</h3>
                    <ul className="drukairkFooter__list">
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/about-us/about-drukair/">About Drukair</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/about-us/media-resources/">Media & Resources</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/about-us/career/">Career</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/about-us/our-commitment-to-you/">Our Commitment to you</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/about-us/sponsorships/">Sponsorships</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/about-us/archive/">Archive</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://kb.drukair.com.bt/index.php/login#new_tab">KBOnline</a></li>
                    </ul>
                </div>

                <div className="drukairkFooter__section">
                    <h3 className="drukairkFooter__sectionTitle">HELP</h3>
                    <ul className="drukairkFooter__list">
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/help-2/help-and-faqs/">Help and FAQs</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/help-2/contact-us/">Contact Us</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/help-2/forms-and-downloads/">Forms and Downloads</a></li>
                    </ul>
                </div>

                <div className="drukairkFooter__section">
                    <h3 className="drukairkFooter__sectionTitle">SERVICES</h3>
                    <ul className="drukairkFooter__list">
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/services/charter/">Charter</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://holidays.drukair.com.bt/">Drukair Holidays</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/services/helicopter-services/">Helicopter Services</a></li>
                    </ul>
                </div>

                <div className="drukairkFooter__section">
                    <h3 className="drukairkFooter__sectionTitle">TERMS AND CONDITIONS</h3>
                    <ul className="drukairkFooter__list">
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/terms-and-conditions/website-terms-of-use/">Website Terms of Use</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/terms-and-conditions/conditions-of-carriage/">Conditions of Carriage</a></li>
                    </ul>
                </div>

                <div className="drukairkFooter__section">
                    <h3 className="drukairkFooter__sectionTitle">BUSINESS PARTNERS</h3>
                    <ul className="drukairkFooter__list">
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/business-partners/suppliers-and-procurement/">Suppliers and Procurement</a></li>
                        <li className="drukairkFooter__listItem"><a href="https://drukair.com.bt/business-partners/trade-partners/">Trade Partners</a></li>
                    </ul>
                </div>


                <div className="drukairkFooter__socialLinks">
                    <h3 className="drukairkFooter__socialTitle">Follow Us</h3>
                    <div className="drukairkFooter__socialIconsContainer">
                        <a href="#" className="drukairkFooter__socialLink">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.facebook.com/Drukair/" className="drukairkFooter__socialLink">
                            <i class="fab fa-x-twitter"></i>                        </a>
                        <a href="https://x.com/Drukair" className="drukairkFooter__socialLink">
                            <i className="fab fa-youtube"></i>
                        </a>
                        <a href="https://www.threads.net/@drukair_royalbhutanairlines" className="drukairkFooter__socialLink">
                            <i className="fab fa-threads"></i>
                        </a>
                        <a href="https://www.instagram.com/drukair_royalbhutanairlines/" className="drukairkFooter__socialLink">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://api.whatsapp.com/send/?phone=97517131300&text&type=phone_number&app_absent=0" className="drukairkFooter__socialLink">
                            <i className="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div className="drukairkFooter__copyright">
                © Drukair Corporation Limited. All rights reserved.
            </div>
        </footer>
    );
};

export default DrukairkFooter;