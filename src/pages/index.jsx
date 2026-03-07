import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, RequireAuth, RequireAdmin } from '@/hooks/useAuth';
import Layout from "./Layout.jsx";

const ClientNDA = lazy(() => import("./ClientNDA"));
const ClientSubmitNDA = lazy(() => import("./ClientSubmitNDA"));
const CreateOrder = lazy(() => import("./CreateOrder"));
const OrderHistory = lazy(() => import("./OrderHistory"));
const ClientKYC = lazy(() => import("./ClientKYC"));
const CurrentOrders = lazy(() => import("./CurrentOrders"));
const ExecutedOrders = lazy(() => import("./ExecutedOrders"));
const CancelledOrders = lazy(() => import("./CancelledOrders"));
const DeletedOrders = lazy(() => import("./DeletedOrders"));
const StaffDashboard = lazy(() => import("./StaffDashboard"));
const StaffKYC = lazy(() => import("./StaffKYC"));
const StaffKYCQueue = lazy(() => import("./StaffKYCQueue"));
const StaffClients = lazy(() => import("./StaffClients"));
const StaffClientRequests = lazy(() => import("./StaffClientRequests"));
const StaffActiveOrders = lazy(() => import("./StaffActiveOrders"));
const StaffExecutedOrders = lazy(() => import("./StaffExecutedOrders"));
const StaffPayeerAccounts = lazy(() => import("./StaffPayeerAccounts"));
const GTrans = lazy(() => import("./GTrans"));
const GTransContactSales = lazy(() => import("./GTransContactSales"));
const GTransWorkScheme = lazy(() => import("./GTransWorkScheme"));
const GTransDocumentation = lazy(() => import("./GTransDocumentation"));
const GTransFAQ = lazy(() => import("./GTransFAQ"));
const GTransLogin = lazy(() => import("./GTransLogin"));
const GTransPresentation = lazy(() => import("./GTransPresentation"));
const UserDashboard = lazy(() => import("./UserDashboard"));
const GTransAPIIntegration = lazy(() => import("./GTransAPIIntegration"));
const GTransB2BPayments = lazy(() => import("./GTransB2BPayments"));
const GTransFXSolutions = lazy(() => import("./GTransFXSolutions"));
const GTransECommerceCollectSettle = lazy(() => import("./GTransECommerceCollectSettle"));
const GTransMerchantPay = lazy(() => import("./GTransMerchantPay"));
const StaffServiceAgreement = lazy(() => import("./StaffServiceAgreement"));
const ClientServiceAgreement = lazy(() => import("./ClientServiceAgreement"));
const StaffCustomerReport = lazy(() => import("./StaffCustomerReport"));
const StaffTransactionReport = lazy(() => import("./StaffTransactionReport"));

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

    StaffServiceAgreement: StaffServiceAgreement,

    ClientServiceAgreement: ClientServiceAgreement,

    StaffCustomerReport: StaffCustomerReport,

    StaffTransactionReport: StaffTransactionReport,


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
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>}>
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

                <Route path="/staffserviceagreement" element={<RequireAdmin><StaffServiceAgreement /></RequireAdmin>} />

                <Route path="/clientserviceagreement" element={<RequireAuth><ClientServiceAgreement /></RequireAuth>} />

                <Route path="/staffcustomerreport" element={<RequireAdmin><StaffCustomerReport /></RequireAdmin>} />

                <Route path="/stafftransactionreport" element={<RequireAdmin><StaffTransactionReport /></RequireAdmin>} />

            </Routes>
            </Suspense>
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