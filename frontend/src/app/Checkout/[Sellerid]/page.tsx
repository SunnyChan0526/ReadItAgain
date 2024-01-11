'use client'
import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Avatar, Typography, Grid, Chip, Box, Divider, Stack, Card, CardActionArea, CardMedia, CardContent, Grow, Dialog, DialogTitle, DialogActions, DialogContent, TextField, InputAdornment, Button, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import PrimarySearchAppBar from "../../appbar";
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

type Book = {
    bookid: number;
    name: string;
    picturepath: string;
    price: number;
    condition: string;
    shipping: string;
};

interface ApiResponse {
    seller_name: string;
    books: Book[];
    total_book_count: number;
    books_total_price: number;
    shipping_options: string;
    shipping_fee: string;
    coupon_name: Array<string>;
    total_amount: number;
}

type CouponType = 'special event' | 'seasoning' | 'shipping fee';

interface Coupon {
    discountcode: number;
    name: string;
    type: CouponType;
    description: string;
    startdate: string;
    enddate: string;
    discountrate: number | null;
    eventtag: string | null;
    minimumamountfordiscount: number | null;
    isable: boolean;
    bookid?: number;
}

interface ShippingMethod {
    address: string;
    defaultaddress: boolean;
}

interface CouponResponse {
    'special event': Coupon[];
    seasoning: Coupon[];
    'shipping fee': Coupon[];
}

type ShippingResponse = {
    '快遞': ShippingMethod[];
    '7-ELEVEN': ShippingMethod[];
    'FamilyMart': ShippingMethod[];
}

type selectship = {
    method: string;
    address: string;
}
interface SelectedCoupons {
    [bookId: number]: Coupon[];
}
function ReadItAgain({ params }: { params: { Sellerid: string } }) {
    const router = useRouter();
    const [entireinfo, setInfo] = useState<ApiResponse>({
        seller_name: '',
        books: [],
        total_book_count: -1,
        books_total_price: -1,
        shipping_options: '',
        shipping_fee: '',
        coupon_name: [''],
        total_amount: -1,
    });
    const [specialcouponDialogOpen, setSpecialCouponDialogOpen] = useState(false);
    const [othercouponDialogOpen, setOtherCouponDialogOpen] = useState(false);
    const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
    const [specialEventCoupons, setSpecialEventCoupons] = useState<Coupon[]>([]);
    const [otherCoupons, setOtherCoupons] = useState<Coupon[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<selectship>({
        method: '未選擇運送方式',
        address: '請選擇地址',
    });
    const [selectedCoupons, setSelectedCoupons] = useState<SelectedCoupons>({});
    const [currentBookId, setCurrentBookId] = useState<number>(-1);
    const [shippingMethods, setShippingMethods] = useState<ShippingResponse>({
        '快遞': [],
        '7-ELEVEN': [],
        'FamilyMart': [],
    });

    const handleOpenSpecialEventCouponDialog = async (bookId: number) => {
        const response = await fetch(`/api/py/checkout/select-coupon/${params.Sellerid}`, { credentials: 'include' });
        const data: CouponResponse = await response.json();

        const filteredCoupons = data['special event'].filter(coupon => coupon.bookid === bookId);
        setSpecialEventCoupons(filteredCoupons);
        setCurrentBookId(bookId);
        setSpecialCouponDialogOpen(true);
    };

    const handleOpenOtherCouponsDialog = async () => {
        const response = await fetch(`/api/py/checkout/select-coupon/${params.Sellerid}`, { credentials: 'include' });
        const data: CouponResponse = await response.json();

        const { ['special event']: _, ...otherTypes } = data;
        const otherCouponsArray: Coupon[] = Object.values(otherTypes).flat();
        setOtherCoupons(otherCouponsArray);
        setOtherCouponDialogOpen(true);
    };

    const handleOpenShippingDialog = async () => {
        // Fetch shipping methods from the API
        // Replace 'sellerId' with actual seller ID
        const response = await fetch(`/api/py/checkout/${params.Sellerid}/shipping_method`, { credentials: 'include' });
        const data: ShippingResponse = await response.json();
        setShippingMethods(data);
        setShippingDialogOpen(true);
    };
    const handleShippingItemClick = (methodstr: string, addressstr: string) => {
        setSelectedShippingMethod({
            method: methodstr,
            address: addressstr,
        });
        setShippingDialogOpen(false);
    }
    const handleCouponItemClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setOtherCouponDialogOpen(false);
    }
    const handleSelectCoupon = (bookId: number, coupon: Coupon) => {
        setSelectedCoupons(prevSelectedCoupons => {
            const currentCouponsForBook = prevSelectedCoupons[bookId] || [];
            if (!currentCouponsForBook.some(c => c.discountcode === coupon.discountcode)) {
                return { ...prevSelectedCoupons, [bookId]: [...currentCouponsForBook, coupon] };
            }
            return prevSelectedCoupons;
        });
        setSpecialCouponDialogOpen(false);
    };
    const CouponDialog = ({ bookId, coupons }: { bookId: number; coupons: Coupon[] }) => (
        <Dialog open={specialcouponDialogOpen} onClose={() => setSpecialEventCoupons([])}>
            <DialogTitle>選擇優惠券</DialogTitle>
            <DialogContent>
                <List>
                    {coupons.length === 0 ? (
                        <Typography>該書本沒有特別優惠券</Typography>
                    ) : (coupons.map((coupon) => (
                        <ListItemButton key={coupon.discountcode} onClick={() => handleSelectCoupon(bookId, coupon)}>
                            <ListItemText primary={coupon.name} secondary={coupon.description} />
                        </ListItemButton>
                    )))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSpecialCouponDialogOpen(false)} className="hover:bg-tan-200">
                    關閉
                </Button>
            </DialogActions>
        </Dialog>
    );
    useEffect(() => {
        const fetchCouponsAndPost = async () => {
            try {
                let couponsArray: Coupon[] = selectedCoupon ? [selectedCoupon] : [];

                Object.values(selectedCoupons).forEach(coupons => {
                    couponsArray = couponsArray.concat(coupons);
                });

                const postResponse = await fetch(`/api/py/checkout/${params.Sellerid}?shipping_options=${selectedShippingMethod.method}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(couponsArray),
                });

                if (!postResponse.ok) {
                    throw new Error('Response from POST was not ok');
                }

                const postResult = await postResponse.json() as ApiResponse;
                console.log('POST result:', postResult);
                setInfo(postResult);
            } catch (error) {
                console.error('Error during fetching and posting coupons:', error);
            }
        };

        fetchCouponsAndPost();
    }, [selectedShippingMethod, selectedCoupons, selectedCoupon]);
    const handleCreateOrder = async () => {
        try {
            let couponsArray: Coupon[] = selectedCoupon ? [selectedCoupon] : [];

            Object.values(selectedCoupons).forEach(coupons => {
                couponsArray = couponsArray.concat(coupons);
            });
            if (!params.Sellerid || selectedShippingMethod.method == "未選擇運送方式") {
                enqueueSnackbar("請確保你選擇了運送方式!", { variant: 'error' });
                return;
            }
            const postResponse = await fetch(`/api/py/checkout-to-order/${params.Sellerid}?shipping_options=${selectedShippingMethod.method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(couponsArray),
            });

            if (!postResponse.ok) {
                throw new Error('Response from POST was not ok');
            }

            const postResult = await postResponse.json() as ApiResponse;
            console.log('POST result:', postResult);
            enqueueSnackbar("已成功下訂單!", { variant: 'success' });
            router.push('/');
        } catch (error) {
            console.error('Error during fetching and posting coupons:', error);
        }
    };
    return (
        <main className="overflow-x-hidden min-h-screen bg-white flex flex-col">
            <SnackbarProvider
                autoHideDuration={1000}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <PrimarySearchAppBar></PrimarySearchAppBar>
                <Grid container spacing={2} direction="row"
                    justifyContent="center"
                    alignItems="center" columns={12} className="pl-4">
                    <Grid container item spacing={2} md={8} className="mt-2">
                        {/* 標題 */}
                        <Grid item xs={12} container justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" className="font-newsfont self-end">結帳</Typography>
                        </Grid>

                        {/* 分割線 */}
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>


                        {/* 書本卡片列表 */}
                        <Grid container item>
                            <Card className="bg-coupon-200 border-coupon-700 min-w-full">
                                <CardContent>
                                    <Grid container
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center">
                                        <Grid item>
                                            <Typography variant="h4" component='span' className="font-bold pr-2" gutterBottom>
                                                {entireinfo.seller_name}
                                            </Typography>
                                            <Typography variant="subtitle1" component="span" className="font-normal text-neutral-500" gutterBottom>
                                                購物車
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            container
                                            direction="row"
                                            justifyContent="flex-end"
                                            alignItems="center"
                                            spacing={14.8}
                                            item
                                        >
                                            <Grid item><Typography variant="body1">書本名稱</Typography></Grid>
                                            <Grid item><Typography variant="body1">書本優惠券</Typography></Grid>
                                            <Grid item><Typography variant="body1">書本狀況</Typography></Grid>
                                            <Grid item><Typography variant="body1">書本地點</Typography></Grid>
                                            <Grid item><Typography variant="body1">價格</Typography></Grid>
                                        </Grid>
                                    </Grid>
                                    {entireinfo.books.map((item, index) => (
                                        <Grid
                                            container
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            columns={20}
                                            key={item.bookid}
                                        >
                                            <Grid item md={4}><Avatar variant="rounded" src={"/api/py/img/book/" + item.picturepath} className="w-20 h-20"></Avatar></Grid>
                                            <Grid item md={3}><Typography variant="body1" className="text-start">{item.name}</Typography></Grid>

                                            <Grid item md={4} className="text-center pr-5"><Button variant="outlined" onClick={() => handleOpenSpecialEventCouponDialog(item.bookid)}>選擇優惠券</Button></Grid>
                                            <Grid item md={3}><Typography variant="body1" className="text-center">{`${item.condition}`}</Typography></Grid>
                                            <Grid item md={3}><Typography variant="body1" className="text-end">{`${item.shipping}`}</Typography></Grid>
                                            <Grid item md={3}><Typography variant="body1" className="text-end">{`${item.price}`}</Typography></Grid>
                                        </Grid>
                                    ))}
                                </CardContent>
                                <Divider />
                                <Grid container
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    className="my-2 ml-2">
                                    <Grid container item
                                        direction='column'
                                        justifyContent="space-between"
                                        alignItems="flex-start" >
                                        <Grid item>
                                            <Button startIcon={<ConfirmationNumberIcon />} onClick={() => handleOpenOtherCouponsDialog()}>訂單優惠券</Button>
                                            <Typography variant="body1" component='span'>{selectedCoupon?.name}</Typography>
                                        </Grid>
                                        <Grid item>
                                            <Button startIcon={<LocalShippingIcon />} onClick={() => handleOpenShippingDialog()}>運送方式</Button>
                                            <Typography variant="body1" component='span' className="font-bold">{selectedShippingMethod.method + ' ‧ '}</Typography>
                                            <Typography variant="body1" component='span' className="text-neutral-500">{selectedShippingMethod.address}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                        {/*書本優惠券彈窗*/}
                        <CouponDialog bookId={currentBookId} coupons={specialEventCoupons} />
                        {/*訂單優惠券彈窗*/}
                        <Dialog open={othercouponDialogOpen} onClose={() => setOtherCouponDialogOpen(false)}>
                            <DialogTitle><ConfirmationNumberIcon className="mr-2"></ConfirmationNumberIcon>選擇優惠券</DialogTitle>
                            <DialogContent>
                                <List>
                                    {otherCoupons && Object.entries(otherCoupons).map(([key, coupon]) => (
                                        <ListItemButton key={coupon.discountcode} onClick={() => handleCouponItemClick(coupon)}>
                                            <ListItemText
                                                primary={<Typography component='span' variant="h5" className="block text-black font-bold">{coupon.name}</Typography>}
                                                secondary={
                                                    <>
                                                        <Typography component='span' variant="body1" className="block">{coupon.description}</Typography>
                                                        <Typography component='span' variant="body1" className="block">{"折價條件 : " + coupon.minimumamountfordiscount}</Typography>
                                                        <Typography component='span' variant="body1" className="block">{"有效時間 : " + coupon.startdate.split('T')[0] + ' ' + coupon.startdate.split('T')[1] + ' ~ ' + coupon.enddate.split('T')[0] + ' ' + coupon.enddate.split('T')[1]}</Typography>
                                                    </>} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </DialogContent>
                        </Dialog>
                        {/*運送選項彈窗*/}
                        <Dialog open={shippingDialogOpen} onClose={() => setShippingDialogOpen(false)}>
                            <DialogTitle><LocalShippingIcon className="mr-2"></LocalShippingIcon>配送方式</DialogTitle>
                            <DialogContent>
                                <List>
                                    {shippingMethods && Object.entries(shippingMethods).map(([key, value]) => (
                                        value.map((method, index) => (
                                            <ListItemButton key={method.address} onClick={() => handleShippingItemClick(key, method.address)}>
                                                {key === "Home" ? <HomeIcon className="mr-4" /> : <StoreIcon className="mr-4" />}
                                                <ListItemText primary={method.address} secondary={key} />
                                            </ListItemButton>
                                        ))
                                    ))}
                                </List>
                            </DialogContent>
                        </Dialog>
                    </Grid>
                    {/* 右側訂單總結 */}
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    訂單總結
                                </Typography>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>書本小計</Typography>
                                    <Typography>{`$${entireinfo.books_total_price}`}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>運費</Typography>
                                    <Typography>{`$${entireinfo.shipping_fee}`}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>優惠券</Typography>
                                    <Typography>{`${entireinfo.coupon_name}`}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>書本數量</Typography>
                                    <Typography>{`${entireinfo.total_book_count}`}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="h6">總計</Typography>
                                    <Typography variant="h6">{`$${entireinfo.total_amount}`}</Typography>
                                </Box>
                                <Button variant="contained" fullWidth onClick={handleCreateOrder}>下訂單</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </SnackbarProvider>
        </main >
    );
}


export default ReadItAgain;