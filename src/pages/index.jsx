import Layout from "./Layout.jsx";
import ClientNDA from "./ClientNDA";
import ClientSubmitNDA from "./ClientSubmitNDA";

import CreateOrder from "./CreateOrder";

import OrderHistory from "./OrderHistory";

import ClientKYC from "./ClientKYC";

import CurrentOrders from "./CurrentOrders";

import ExecutedOrders from "./ExecutedOrders";

import CancelledOrders from "./CancelledOrders";

import DeletedOrders from "./DeletedOrders";

import StaffDashboard from "./StaffDashboard";

import StaffKYC from "./StaffKYC";

import StaffKYCQueue from "./StaffKYCQueue";

import StaffClients from "./StaffClients";

import StaffClientRequests from "./StaffClientRequests";

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
import { useEffect } from 'react';
import { AuthProvider, RequireAuth, RequireAdmin } from '@/hooks/useAuth';

const PAGES = {

    CreateOrder: CreateOrder,

    OrderHistory: OrderHistory,

    CurrentOrders: CurrentOrders,

    ClientKYC: ClientKYC,

    ClientNDA: ClientNDA,

    ClientSubmitNDA: ClientSubmitNDA,

    ExecutedOrders: ExecutedOrders,

    CancelledOrders: CancelledOrders,

    DeletedOrders: DeletedOrders,

    StaffDashboard: StaffDashboard,

    StaffKYC: StaffKYC,

    StaffKYCQueue: StaffKYCQueue,

    StaffClients: StaffClients,

    StaffClientRequests: StaffClientRequests,

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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<GTrans />} />


                <Route path="/createorder" element={<RequireAuth><CreateOrder /></RequireAuth>} />

                <Route path="/orderhistory" element={<RequireAuth><OrderHistory /></RequireAuth>} />

                <Route path="/currentorders" element={<RequireAuth><CurrentOrders /></RequireAuth>} />

                <Route path="/executedorders" element={<RequireAuth><ExecutedOrders /></RequireAuth>} />

                <Route path="/cancelledorders" element={<RequireAuth><CancelledOrders /></RequireAuth>} />

                <Route path="/clientkyc" element={<RequireAuth><ClientKYC /></RequireAuth>} />

                <Route path="/clientnda" element={<RequireAuth><ClientNDA /></RequireAuth>} />

                <Route path="/clientsubmitnda" element={<RequireAuth><ClientSubmitNDA /></RequireAuth>} />

                <Route path="/staffkycqueue" element={<RequireAdmin><StaffKYCQueue /></RequireAdmin>} />

                <Route path="/deletedorders" element={<RequireAuth><DeletedOrders /></RequireAuth>} />

                <Route path="/staffdashboard" element={<RequireAdmin><StaffDashboard /></RequireAdmin>} />

                <Route path="/staffkyc" element={<RequireAdmin><StaffKYC /></RequireAdmin>} />

                <Route path="/staffclients" element={<RequireAdmin><StaffClients /></RequireAdmin>} />

                <Route path="/staffclientrequests" element={<RequireAdmin><StaffClientRequests /></RequireAdmin>} />

                <Route path="/staffactiveorders" element={<RequireAdmin><StaffActiveOrders /></RequireAdmin>} />

                <Route path="/staffexecutedorders" element={<RequireAdmin><StaffExecutedOrders /></RequireAdmin>} />

                <Route path="/staffpayeeraccounts" element={<RequireAdmin><StaffPayeerAccounts /></RequireAdmin>} />

                <Route path="/gtrans" element={<GTrans />} />

                <Route path="/gtranscontactsales" element={<GTransContactSales />} />

                <Route path="/gtransworkscheme" element={<GTransWorkScheme />} />

                <Route path="/gtransdocumentation" element={<GTransDocumentation />} />

                <Route path="/gtransfaq" element={<GTransFAQ />} />

                <Route path="/gtranslogin" element={<GTransLogin />} />

                <Route path="/gtranspresentation" element={<GTransPresentation />} />

                <Route path="/userdashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />

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
            <AuthProvider>
                <PagesContent />
            </AuthProvider>
        </Router>
    );
}