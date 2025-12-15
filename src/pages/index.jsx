import Layout from "./Layout.jsx";

import CreateOrder from "./CreateOrder";

import OrderHistory from "./OrderHistory";

import StaffDashboard from "./StaffDashboard";

import StaffClients from "./StaffClients";

import StaffActiveOrders from "./StaffActiveOrders";

import StaffExecutedOrders from "./StaffExecutedOrders";

import StaffPayeerAccounts from "./StaffPayeerAccounts";

import GTrans from "./GTrans";

import GTransContactSales from "./GTransContactSales";

import GTransWorkScheme from "./GTransWorkScheme";

import GTransDocumentation from "./GTransDocumentation";

import GTransFAQ from "./GTransFAQ";

import GTransLogin from "./GTransLogin";

import GTransPresentation from "./GTransPresentation";

import UserDashboard from "./UserDashboard";

import GTransAPIIntegration from "./GTransAPIIntegration";

import GTransB2BPayments from "./GTransB2BPayments";

import GTransFXSolutions from "./GTransFXSolutions";

import GTransECommerceCollectSettle from "./GTransECommerceCollectSettle";

import GTransMerchantPay from "./GTransMerchantPay";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    CreateOrder: CreateOrder,
    
    OrderHistory: OrderHistory,
    
    StaffDashboard: StaffDashboard,
    
    StaffClients: StaffClients,
    
    StaffActiveOrders: StaffActiveOrders,
    
    StaffExecutedOrders: StaffExecutedOrders,
    
    StaffPayeerAccounts: StaffPayeerAccounts,
    
    GTrans: GTrans,
    
    GTransContactSales: GTransContactSales,
    
    GTransWorkScheme: GTransWorkScheme,
    
    GTransDocumentation: GTransDocumentation,
    
    GTransFAQ: GTransFAQ,
    
    GTransLogin: GTransLogin,
    
    GTransPresentation: GTransPresentation,
    
    UserDashboard: UserDashboard,
    
    GTransAPIIntegration: GTransAPIIntegration,
    
    GTransB2BPayments: GTransB2BPayments,
    
    GTransFXSolutions: GTransFXSolutions,
    
    GTransECommerceCollectSettle: GTransECommerceCollectSettle,
    
    GTransMerchantPay: GTransMerchantPay,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<GTrans />} />
                
                
                <Route path="/createorder" element={<CreateOrder />} />
                
                <Route path="/orderhistory" element={<OrderHistory />} />
                
                <Route path="/staffdashboard" element={<StaffDashboard />} />
                
                <Route path="/staffclients" element={<StaffClients />} />
                
                <Route path="/staffactiveorders" element={<StaffActiveOrders />} />
                
                <Route path="/staffexecutedorders" element={<StaffExecutedOrders />} />
                
                <Route path="/staffpayeeraccounts" element={<StaffPayeerAccounts />} />
                
                <Route path="/gtrans" element={<GTrans />} />
                
                <Route path="/gtranscontactsales" element={<GTransContactSales />} />
                
                <Route path="/gtransworkscheme" element={<GTransWorkScheme />} />
                
                <Route path="/gtransdocumentation" element={<GTransDocumentation />} />
                
                <Route path="/gtransfaq" element={<GTransFAQ />} />
                
                <Route path="/gtranslogin" element={<GTransLogin />} />
                
                <Route path="/gtranspresentation" element={<GTransPresentation />} />
                
                <Route path="/userdashboard" element={<UserDashboard />} />
                
                <Route path="/gtransapiintegration" element={<GTransAPIIntegration />} />
                
                <Route path="/gtransb2bpayments" element={<GTransB2BPayments />} />
                
                <Route path="/gtransfxsolutions" element={<GTransFXSolutions />} />
                
                <Route path="/gtransecommercecollectsettle" element={<GTransECommerceCollectSettle />} />
                
                <Route path="/gtransmerchantpay" element={<GTransMerchantPay />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}