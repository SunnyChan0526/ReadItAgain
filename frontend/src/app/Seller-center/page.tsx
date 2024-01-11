'use client'
import React from "react";
import Image from 'next/image'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Container, Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Rating, Typography, TextField, Button, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, Grid, Avatar, Grow, Stack, Card, CardMedia, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, IconButton, InputAdornment, Breadcrumbs } from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PrimarySearchAppBar from "../appbar";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
interface UserProfile {
    userid: number;
    account: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    birthdate: string;
    profilepicture: string;
}
interface Book {
    bookname: string;
    bookpicturepath: string;
    price: number;
}

interface Order {
    orderid: number;
    orderstatus: string;
    ordertime: string;
    ordercancelreason: string;
    customerid: number;
    customername: string;
    books: Book[];
    totalbookcount: number;
    totalamount: number;
    shippingmethod: string;
}
function ReadItAgain() {
    const [activeComponent, setActiveComponent] = React.useState('orders');
    return (
        <main className="overflow-x-hidden min-h-screen bg-white flex flex-col">
            <SnackbarProvider
                autoHideDuration={1000}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <PrimarySearchAppBar></PrimarySearchAppBar>
                    <Container>
                        <Grow in={activeComponent === 'orders'} mountOnEnter unmountOnExit>
                            <div>
                                <MyOrdersContent setActiveComponent={setActiveComponent} />
                            </div>
                        </Grow>
                        <Grow in={activeComponent === 'coupon'} mountOnEnter unmountOnExit>
                            <div>
                                <MyCouponContent setActiveComponent={setActiveComponent} />
                            </div>
                        </Grow>
                    </Container>
                </LocalizationProvider>
            </SnackbarProvider>
        </main>
    );
}
const MyOrdersContent = ({ setActiveComponent }: { setActiveComponent: (value: string) => void }) => {
    const [profile, setProfile] = React.useState<UserProfile>({
        userid: 0,
        account: '如果你看到這個訊息請登入',
        name: '請登入',
        email: '',
        phone: '',
        gender: '',
        birthdate: '',
        profilepicture: ''
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/py/profile/view', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: UserProfile = await response.json();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch user's profile:", error);
            }
        };

        fetchData();
    }, []);
    const [orders, setOrders] = React.useState<Order[]>([]);
    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/py/seller/orders?order_status=All', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Order[] = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Could not fetch orders", error);
        }
    };
    React.useEffect(() => {
        fetchOrders();
    }, []);
    const getOrderButton = (orderStatus: string, order_id: number) => {
        switch (orderStatus) {
            case "To ship":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        aria-label="cancel order"
                        className="span"
                        onClick={() => handleTestShip(order_id)}
                    >
                        未運送
                    </Button>
                );
            case "Cancelling":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        aria-label="cancel order"
                        className="span text-yellow-400"
                        onClick={() => handleOpenCancelDialog(order_id)}
                    >
                        等待受理取消請求
                    </Button>
                );
            case "CancelDenied":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        aria-label="cancel order"
                        className="span text-red-500"
                    >
                        訂單被拒絕取消，請聯絡賣家
                    </Button>
                );
            case "Cancelled":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        aria-label="cancel order"
                        className="span text-red-500"
                    >
                        訂單已取消
                    </Button>
                );
            case "Shipping":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<LocalShippingIcon />}
                        aria-label="shipping order"
                        onClick={() => handleTestShip(order_id)}
                    >
                        訂單運送中
                    </Button>
                );
            case "Completed":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<RateReviewIcon />}
                        aria-label="review order"
                        onClick={() => handleOpenDialog(order_id)}
                    >
                        查看買家評論
                    </Button>
                );
            default:
                return null;
        }
    };
    const [openDialog, setOpenDialog] = React.useState(false);
    const [currentComment, setCurrentComment] = React.useState('');
    const [currentStars, setCurrentStars] = React.useState<number | null>(null);
    const [activeOrderId, setActiveOrderId] = React.useState<number | null>(null);
    const [openCancelDialog, setOpenCancelDialog] = React.useState(false);
    const [cancellationReason, setCancellationReason] = React.useState('');
    const [isAccepted, setIsAccepted] = React.useState(false);
    const handleOpenDialog = async (orderid: number) => {
        setActiveOrderId(orderid);
        try {
            const response = await fetch(`/api/py/seller/orders/${orderid}/comment`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.comment) {
                setCurrentComment(data.comment);
            }
            if (data.stars) {
                setCurrentStars(data.stars);
            }
        } catch (error) {
            console.error('Error fetching current comment', error);
        }
        setOpenDialog(true);
    };
    const handleOpenCancelDialog = (orderid: number) => {
        setActiveOrderId(orderid);
        setOpenCancelDialog(true);
        setCancellationReason('');
        setIsAccepted(false);
    };
    const handleCloseCancelDialog = () => {
        setOpenCancelDialog(false);
    };
    const handleCancelOrder = async () => {
        if (activeOrderId !== null) {
            try {
                const response = await fetch(`/api/py/cancel_orders_pr/seller/${activeOrderId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        is_accepted: isAccepted,
                        reason: cancellationReason,
                    }),
                });

                if (response.ok) {
                    // Handle successful submission
                    enqueueSnackbar("已成功回應取消請求", { variant: 'success' })
                    setOpenDialog(false);
                } else {
                    // Handle errors
                    enqueueSnackbar("失敗回應取消請求", { variant: 'error' })
                    console.error('Failed to submit cancellation');
                }
            } catch (error) {
                console.error('Error submitting cancellation', error);
            }
        }
    };
    const handleTestShip = async (orderid: number) => {
        const response = await fetch(`/api/py/update_orders_status/seller/${orderid}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            enqueueSnackbar("成功改變運送狀態!", { variant: 'success' });
            fetchOrders();
        } else {
            enqueueSnackbar("改變運送狀態失敗", { variant: 'error' });
            console.error('Failed to cancel the order');
        }
    };
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredOrders = orders
        .filter(order => statusFilter === 'All' || order.orderstatus === statusFilter)
        .filter(order => order.books.some(book => book.bookname.toLowerCase().includes(searchTerm.toLowerCase())));
    const convertToGMTPlus8 = (dateString: string) => {
        const originalDate = new Date(dateString);
        const gmtPlus8Date = new Date(originalDate.getTime() + (8 * 60 * 60 * 1000));
        return gmtPlus8Date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };
    return (
        <Grid container justifyContent="flex-start" alignItems="flex-start" className="pt-8 pr-5">
            <Grid item sx={{ borderRadius: '10px', overflow: 'hidden' }} className="bg-coupon-200 border-coupon-700 border">
                <Box className="p-8">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text-center text-[34px]">
                        Hi, {profile.name}
                    </Typography>
                </Box>
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem>
                        <ListItemIcon >
                            <ShoppingBasketIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的賣場</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" color='secondary'>我的訂單</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('coupon')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的優惠券</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('books')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的書本</Typography>
                    </ListItemButton>
                </List>
            </Grid>
            <Grid item className="pl-20 w-[850px]">
                <Typography variant="h4" className="ml-3 mb-3 font-newsfont">我的訂單</Typography>
                <Divider variant="middle"></Divider>
                <Stack direction="column" className="mt-4" alignItems="center">
                    <TextField
                        fullWidth
                        id="search-orders"
                        variant="outlined"
                        size="small"
                        placeholder="Search by book name"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => { /* Handle search submit */ }}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Breadcrumbs aria-label="breadcrumb" className="mt-2">
                        {['All', 'To ship', 'Shipping', 'Completed', 'Cancelling', 'CancelDenied', 'Cancelled'].map((status) => (
                            <Button
                                key={status}
                                color={statusFilter === status ? 'primary' : 'inherit'}
                                style={{ cursor: 'pointer' }}
                                size="small"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </Button>
                        ))}
                    </Breadcrumbs>
                </Stack>
                <Grid container spacing={2} className="mt-1">
                    {filteredOrders.map((order) => (
                        <Grid item xs={12} key={order.orderid}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h5" className="font-semibold">{"買家 : " + order.customername}</Typography>
                                        <Typography variant="subtitle1">{"訂單時間 : " + convertToGMTPlus8(order.ordertime)}</Typography>
                                        {getOrderButton(order.orderstatus, order.orderid)}
                                        <Typography variant="subtitle1">{order.ordercancelreason}</Typography>
                                    </Stack>
                                    <Typography color="text.secondary">
                                        {order.orderstatus} | {order.totalbookcount} Books | ${order.totalamount} | {order.shippingmethod}
                                    </Typography>
                                    <List>
                                        {order.books.map((book, index) => (
                                            <ListItem key={index} className="bg-coupon-200">
                                                <CardMedia
                                                    component="img"
                                                    sx={{ width: 70 }}
                                                    className="rounded-s-lg"
                                                    image={`/api/py/img/book/${book.bookpicturepath}`} // Adjust the path as needed
                                                    alt={book.bookname}
                                                />
                                                <Stack direction="row" spacing={4} className="ml-4">
                                                    <Typography variant="subtitle1">{book.bookname}</Typography>
                                                    <Typography variant="subtitle2">${book.price}</Typography>
                                                </Stack>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>訂單評論</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="comment"
                            label="Comment"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={currentComment}
                            disabled
                            onChange={(e) => setCurrentComment(e.target.value)}
                        />
                        <Rating
                            name="simple-controlled"
                            value={currentStars}
                            onChange={(event, newValue) => {
                                setCurrentStars(newValue);
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>關閉</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
                    <DialogTitle>回應取消請求</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="reason"
                            label="取消理由"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isAccepted}
                                    onChange={(e) => setIsAccepted(e.target.checked)}
                                />
                            }
                            label="是否同意取消"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCancelDialog(false)}>關閉</Button>
                        <Button onClick={handleCancelOrder}>送出</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
}
const MyCouponContent = ({ setActiveComponent }: { setActiveComponent: (value: string) => void }) => {
    const [profile, setProfile] = React.useState<UserProfile>({
        userid: 0,
        account: '如果你看到這個訊息請登入',
        name: '請登入',
        email: '',
        phone: '',
        gender: '',
        birthdate: '',
        profilepicture: ''
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/py/profile/view', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: UserProfile = await response.json();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch user's profile:", error);
            }
        };

        fetchData();
    }, []);
    
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const convertToGMTPlus8 = (dateString: string) => {
        const originalDate = new Date(dateString);
        const gmtPlus8Date = new Date(originalDate.getTime() + (8 * 60 * 60 * 1000));
        return gmtPlus8Date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };
    return (
        <Grid container justifyContent="flex-start" alignItems="flex-start" className="pt-8 pr-5">
            <Grid item sx={{ borderRadius: '10px', overflow: 'hidden' }} className="bg-coupon-200 border-coupon-700 border">
                <Box className="p-8">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text-center text-[34px]">
                        Hi, {profile.name}
                    </Typography>
                </Box>
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem>
                        <ListItemIcon >
                            <ShoppingBasketIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的賣場</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的訂單</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" color='secondary'>我的優惠券</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的書本</Typography>
                    </ListItemButton>
                </List>
            </Grid>
            <Grid item className="pl-20 w-[850px]">
                <Typography variant="h4" className="ml-3 mb-3 font-newsfont">我的優惠券</Typography>
                <Divider variant="middle"></Divider>
                <Stack direction="column" className="mt-4" alignItems="center">
                    <TextField
                        fullWidth
                        id="search-orders"
                        variant="outlined"
                        size="small"
                        placeholder="Search by book name"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => { /* Handle search submit */ }}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Breadcrumbs aria-label="breadcrumb" className="mt-2">
                        {['All', 'seasoning', 'shipping fee', 'special event'].map((status) => (
                            <Button
                                key={status}
                                color={statusFilter === status ? 'primary' : 'inherit'}
                                style={{ cursor: 'pointer' }}
                                size="small"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </Button>
                        ))}
                    </Breadcrumbs>
                </Stack>
                
            </Grid>
        </Grid>
    );
}
export default ReadItAgain;