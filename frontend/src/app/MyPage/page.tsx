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
interface Address {
    addressid: number;
    address: string;
    defaultaddress: boolean;
}

interface Addresses {
    "快遞": Address[];
    "7-ELEVEN": Address[];
    "全家": Address[];
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
    sellerid: number;
    sellername: string;
    books: Book[];
    totalbookcount: number;
    totalamount: number;
    shippingmethod: string;
}
function ReadItAgain() {
    const [activeComponent, setActiveComponent] = React.useState('profile');
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
                        <Grow in={activeComponent === 'profile'} mountOnEnter unmountOnExit>
                            <div>
                                <Myprofile setActiveComponent={setActiveComponent} />
                            </div>
                        </Grow>
                        <Grow in={activeComponent === 'address'} mountOnEnter unmountOnExit>
                            <div>
                                <MyAddress setActiveComponent={setActiveComponent} />
                            </div>
                        </Grow>
                        <Grow in={activeComponent === 'changePassword'} mountOnEnter unmountOnExit>
                            <div>
                                <ChangePasswordContent setActiveComponent={setActiveComponent} />
                            </div>
                        </Grow>
                        <Grow in={activeComponent === 'orders'} mountOnEnter unmountOnExit>
                            <div>
                                <MyOrdersContent setActiveComponent={setActiveComponent} />
                            </div>
                        </Grow>
                    </Container>
                </LocalizationProvider>
            </SnackbarProvider>
        </main>
    );
}
const Myprofile = ({ setActiveComponent }: { setActiveComponent: (value: string) => void }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value,
        }));
    };
    const [Birthday, setBirthDay] = React.useState<Dayjs | null>(null);
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

    const [errors, setErrors] = React.useState({
        name: '',
        email: '',
        phone: '',
    });
    const emailRegex = /\S+@\S+\.\S+/;
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });
    const [cacheBreaker, setCacheBreaker] = React.useState(Date.now());
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
                setBirthDay(dayjs(data.birthdate));
            } catch (error) {
                console.error("Failed to fetch user's profile:", error);
            }
        };

        fetchData();
    }, [cacheBreaker]);
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const formData = new FormData();
            formData.append('avatar', files[0]);

            try {
                const response = await fetch('/api/py/profile/upload_avatar', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log('File uploaded successfully');
                setCacheBreaker(Date.now());
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };
    const handleSaveClick = async () => {

        setErrors({ name: '', email: '', phone: '' });

        let hasError = false;
        let newErrors = { name: '', email: '', phone: '' };

        if (!profile.name) {
            newErrors.name = '姓名不能為空';
            hasError = true;
        }
        if (!emailRegex.test(profile.email)) {
            newErrors.email = '請輸入有效的電子郵件地址';
            hasError = true;
        }
        if (profile.phone.length < 10) {
            newErrors.phone = '手機號碼請填寫10個數字';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            enqueueSnackbar("有錯誤的欄位!", { variant: 'error' });
            return;
        }
        const formData = {
            name_input: profile.name,
            email_input: profile.email,
            phone_input: profile.phone,
            gender_input: profile.gender,
            birthdate_input: Birthday ? Birthday.toISOString().split('T')[0] : null,
        };

        try {
            const response = await fetch('/api/py/profile/edit', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Profile updated:', data);
            enqueueSnackbar("成功更新個人檔案!", { variant: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };
    return (
        <Grid container justifyContent="flex-start" alignItems="center" className="pt-8 pr-5">
            <Grid item sx={{ borderRadius: '10px', overflow: 'hidden' }} className="bg-coupon-200 border-coupon-700 border">
                <Box className="p-8">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text-center text-[34px]">
                        Hi, {profile.name}
                    </Typography>
                </Box>

                <List component="nav" aria-label="main mailbox folders">
                    <ListItem>
                        <ListItemIcon>
                            <AccountBoxIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的帳號</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('profile')}>
                        <Typography component='span' variant="h6" color='secondary'>個人檔案</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('address')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的地址</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('changePassword')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">更改密碼</Typography>
                    </ListItemButton>
                </List>
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem>
                        <ListItemIcon >
                            <ShoppingBasketIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的購物</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的訂單</Typography>
                    </ListItemButton>
                </List>
            </Grid>
            <Grid item className="pl-20 w-[850px]">
                <Typography variant="h4" className="ml-3 mb-3 font-newsfont">個人檔案</Typography>
                <Divider variant="middle"></Divider>
                <Grid container direction='row' justifyContent="center"
                    alignItems="stretch"
                    spacing={2}>
                    <Grid container item direction="column"
                        justifyContent="space-between"
                        alignItems="stretch"
                        className="w-[400px]"
                    >
                        <TextField name="account" margin="normal" value={profile.account} disabled label="帳號" variant="standard" />
                        <TextField name="name" margin="normal" value={profile.name} label="姓名" onChange={handleChange} variant="standard" error={!!errors.name}
                            helperText={errors.name} />
                        <TextField name="email" margin="normal" value={profile.email} label="Email" onChange={handleChange} variant="standard" error={!!errors.email}
                            helperText={errors.email} />
                        <TextField name="phone" margin="normal" value={profile.phone} label="手機號碼" onChange={handleChange} variant="standard" error={!!errors.phone}
                            helperText={errors.phone} />
                        <FormControl>
                            <FormLabel>性別</FormLabel>
                            <RadioGroup row aria-label="gender" name="gender" value={profile.gender}
                                onChange={handleChange}>
                                <FormControlLabel value="女性" control={<Radio />} label="女性" />
                                <FormControlLabel value="男性" control={<Radio />} label="男性" />
                                <FormControlLabel value="中性" control={<Radio />} label="中性" />
                                <FormControlLabel value="保密" control={<Radio />} label="保密" />
                            </RadioGroup>
                        </FormControl>
                        <DateField
                            label="出生日期"
                            format="YYYY-MM-DD"
                            fullWidth
                            required
                            value={Birthday}
                            onChange={(newValue) => setBirthDay(newValue)}
                            variant="standard"
                        />
                        <Button variant="contained" color="primary" sx={{ mt: 2 }} className="self-end" onClick={handleSaveClick}>Save</Button>
                    </Grid>
                    <Grid item >
                        <Divider orientation="vertical" variant="middle" className="w-px h-full" />
                    </Grid>
                    <Grid item container direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        className="w-[200px]">
                        <Avatar className="w-[200px] h-[200px] mb-10" src={profile.profilepicture ? 'api/py/img/avatar/' + profile.profilepicture + '?cacheBreaker=' + cacheBreaker : ''}>測</Avatar>
                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} className="self-center">
                            更換頭像
                            <VisuallyHiddenInput type="file"
                                onChange={handleFileUpload} />
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
const MyAddress = ({ setActiveComponent }: { setActiveComponent: (value: string) => void }) => {
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
    const [addresses, setAddresses] = React.useState<Addresses | null>(null);
    const [open, setOpen] = React.useState(false);
    const [editopen, setEditOpen] = React.useState(false);
    const [address, setAddress] = React.useState('');
    const [defaultAddress, setDefaultAddress] = React.useState(false);
    const [shippingOption, setShippingOption] = React.useState('快遞');
    const [errors, setErrors] = React.useState('');
    const [noweditloc, setEditAddressLoc] = React.useState('');
    const [nowedit, setEditAddress] = React.useState<Address>({
        addressid: 0,
        address: '',
        defaultaddress: false
    });
    const Add_Address = async () => {
        const body = {
            address,
            defaultaddress: defaultAddress,
            shippingoption: shippingOption
        };

        let hasError = false;

        if (!body.address) {
            setErrors('地址欄不能為空!');
            hasError = true;
        }

        if (hasError) {
            enqueueSnackbar("有錯誤的欄位!", { variant: 'error' });
            return;
        }
        try {
            const response = await fetch('/api/py/address/create', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setOpen(false);
                fetchAddresses();
                enqueueSnackbar("成功新增地址", { variant: 'success' });
            } else {
                enqueueSnackbar("請登入後再試", { variant: 'error' });
                console.error('Failed to create address');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const Edit_Address_dialog = (loc: string, editaddress: Address) => {
        setEditOpen(true);
        setEditAddress(editaddress);
        setEditAddressLoc(loc);
    }
    const Edit_Address = async () => {
        const body = {
            address: nowedit?.address,
            defaultaddress: nowedit?.defaultaddress,
            shippingoption: noweditloc
        };
        let url = '/api/py/address/edit/' + nowedit.addressid.toString()
        let hasError = false;

        if (!body.address) {
            setErrors('地址欄不能為空!');
            hasError = true;
        }

        if (hasError) {
            enqueueSnackbar("有錯誤的欄位!", { variant: 'error' });
            return;
        }
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setOpen(false);
                fetchAddresses();
                enqueueSnackbar("成功修改地址", { variant: 'success' });
            } else {
                enqueueSnackbar("請登入後再試", { variant: 'error' });
                console.error('Failed to create address');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const Delete_Address = async (addressid: number) => {
        let url = '/api/py/address/delete/' + addressid.toString()
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchAddresses();
                enqueueSnackbar("成功刪除地址", { variant: 'success' });
            } else {
                enqueueSnackbar("請登入後再試", { variant: 'error' });
                console.error('Failed to create address');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    function fetchAddresses() {
        fetch('/api/py/address/show', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                setAddresses(data as Addresses);
            })
            .catch(error => {
                console.error('Error fetching address data:', error);
            });
    }
    React.useEffect(() => {
        fetchAddresses();
    }, []);
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
    return (
        <Grid container justifyContent="flex-start" alignItems="flex-start" className="pt-8 pr-5">
            <Grid item sx={{ borderRadius: '10px', overflow: 'hidden' }} className="bg-coupon-200 border-coupon-700 border">
                <Box className="p-8">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text-center text-[34px]">
                        Hi, {profile.name}
                    </Typography>
                </Box>

                <List component="nav" aria-label="main mailbox folders">
                    <ListItem>
                        <ListItemIcon>
                            <AccountBoxIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的帳號</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('profile')}>
                        <Typography component='span' variant="h6" className='text-neutral-500'>個人檔案</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('address')}>
                        <Typography component='span' variant="h6" color="secondary">我的地址</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('changePassword')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">更改密碼</Typography>
                    </ListItemButton>
                </List>
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem>
                        <ListItemIcon >
                            <ShoppingBasketIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的購物</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的訂單</Typography>
                    </ListItemButton>
                </List>
            </Grid>
            <Grid item className="pl-20 w-[850px]">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" className="ml-3 mb-3 font-newsfont">我的地址</Typography>
                    <Button className="mr-4 bg-tan-400 py-1" variant="contained" onClick={() => setOpen(true)}>新增地址</Button>
                </Stack>
                <Divider variant="middle"></Divider>
                <Stack direction="column" className="mt-4 w-11/12">
                    {addresses && Object.entries(addresses).map(([key, value]) => (
                        <Box key={key} className="ml-4" sx={{ marginBottom: 2 }}>
                            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                                {key}
                            </Typography>
                            {value.map((address: Address) => (
                                <Card key={address.addressid} className="bg-coupon-200" variant="outlined" sx={{ marginBottom: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            {address.defaultaddress ? '預設地址' : '地址'}
                                        </Typography>
                                        <Typography variant="body1">
                                            {address.address}
                                        </Typography>
                                        <Button variant="contained" sx={{ marginTop: 2 }} onClick={() => Edit_Address_dialog(key, address)}>
                                            修改
                                        </Button>
                                        <Button variant="outlined" sx={{ marginTop: 2 }} className="ml-4" onClick={() => Delete_Address(address.addressid)}>
                                            刪除
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ))}
                </Stack>
            </Grid>
            <Dialog open={editopen} onClose={() => setEditOpen(false)}>
                <DialogTitle>修改地址</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="address"
                        label="地址"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={nowedit.address}
                        error={!!errors}
                        helperText={errors}
                        onChange={e => setEditAddress({ ...nowedit, address: e.target.value })}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={nowedit.defaultaddress}
                                onChange={e => setEditAddress({ ...nowedit, defaultaddress: e.target.checked })}
                            />
                        }
                        label="設為預設地址"
                    />
                    <RadioGroup
                        aria-label="shippingoption"
                        name="shippingoption"
                        value={noweditloc}
                        onChange={(e) => setEditAddressLoc(e.target.value)}
                    >
                        <FormControlLabel value="快遞" control={<Radio />} label="快遞" />
                        <FormControlLabel value="7-ELEVEN" control={<Radio />} label="7-ELEVEN" />
                        <FormControlLabel value="全家" control={<Radio />} label="全家" />
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>關閉</Button>
                    <Button onClick={Edit_Address}>送出</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>新增地址</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="address"
                        label="地址"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={address}
                        error={!!errors}
                        helperText={errors}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={defaultAddress}
                                onChange={(e) => setDefaultAddress(e.target.checked)}
                            />
                        }
                        label="設為預設地址"
                    />
                    <RadioGroup
                        aria-label="shippingoption"
                        name="shippingoption"
                        value={shippingOption}
                        onChange={(e) => setShippingOption(e.target.value)}
                    >
                        <FormControlLabel value="快遞" control={<Radio />} label="快遞" />
                        <FormControlLabel value="7-ELEVEN" control={<Radio />} label="7-ELEVEN" />
                        <FormControlLabel value="全家" control={<Radio />} label="全家" />
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>關閉</Button>
                    <Button onClick={Add_Address}>送出</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
const ChangePasswordContent = ({ setActiveComponent }: { setActiveComponent: (value: string) => void }) => {
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

    const [errors, setErrors] = React.useState({
        original_pass: '',
        newpass: '',
        newpass_rept: '',
    });
    const [ori_pass, setOriginalPass] = React.useState('');
    const [newpass, setNewPass] = React.useState('');
    const [rept_newpass, setReptNewPass] = React.useState('');
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
    const handleSaveClick = async () => {

        setErrors({
            original_pass: '',
            newpass: '',
            newpass_rept: '',
        });

        let hasError = false;
        let newErrors = {
            original_pass: '',
            newpass: '',
            newpass_rept: '',
        };

        if (!ori_pass) {
            newErrors.original_pass = '原密碼不能為空!';
            hasError = true;
        }
        if (newpass != rept_newpass) {
            newErrors.newpass = '新密碼請跟重覆新密碼相同';
            newErrors.newpass_rept = '新密碼請跟重覆新密碼相同!';
            hasError = true;
        }
        if (!newpass) {
            newErrors.newpass = '新密碼不能為空';
            hasError = true;
        }
        if (!rept_newpass) {
            newErrors.newpass_rept = '請重覆填寫你的新密碼!';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            enqueueSnackbar("有錯誤的欄位!", { variant: 'error' });
            return;
        }
        const formData = {
            origin_password: ori_pass,
            new_password: newpass,
            new_password_check: rept_newpass,
        };

        try {
            const response = await fetch('/api/py/change_password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Password updated:', data);
            if (data == "the origin password is incorrect") {
                enqueueSnackbar("原始密碼錯誤!", { variant: 'error' });
            }
            else {
                enqueueSnackbar("成功更新密碼", { variant: 'success' });
            }
        } catch (error) {
            enqueueSnackbar("請登入!", { variant: 'error' });
            console.error('Error updating profile:', error);
        }
    };
    return (
        <Grid container justifyContent="flex-start" alignItems="center" className="pt-8 pr-5">
            <Grid item sx={{ borderRadius: '10px', overflow: 'hidden' }} className="bg-coupon-200 border-coupon-700 border">
                <Box className="p-8">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }} className="text-center text-[34px]">
                        Hi, {profile.name}
                    </Typography>
                </Box>

                <List component="nav" aria-label="main mailbox folders">
                    <ListItem>
                        <ListItemIcon>
                            <AccountBoxIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的帳號</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('profile')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">個人檔案</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('address')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的地址</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('changePassword')}>
                        <Typography component='span' variant="h6" color='secondary'>更改密碼</Typography>
                    </ListItemButton>
                </List>
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem>
                        <ListItemIcon >
                            <ShoppingBasketIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的購物</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的訂單</Typography>
                    </ListItemButton>
                </List>
            </Grid>
            <Grid item className="pl-20 w-[850px]">
                <Typography variant="h4" className="ml-3 mb-3 font-newsfont">更改密碼</Typography>
                <Divider variant="middle"></Divider>
                <Grid container direction='row' justifyContent="center"
                    alignItems="stretch"
                    spacing={2}>
                    <Grid container item direction="column"
                        justifyContent="space-between"
                        alignItems="stretch"
                        className="w-[400px]"
                    >
                        <TextField name="original_pass" margin="normal" value={ori_pass} label="原密碼" onChange={(e) => setOriginalPass(e.target.value)} variant="standard" error={!!errors.original_pass}
                            helperText={errors.original_pass} />
                        <TextField name="newpass" margin="normal" value={newpass} label="新密碼" onChange={(e) => setNewPass(e.target.value)} variant="standard" error={!!errors.newpass}
                            helperText={errors.newpass} />
                        <TextField name="newpass_rept" margin="normal" value={rept_newpass} label="重覆新密碼" onChange={(e) => setReptNewPass(e.target.value)} variant="standard" error={!!errors.newpass_rept}
                            helperText={errors.newpass_rept} />
                        <Button variant="contained" color="primary" sx={{ mt: 2 }} className="self-end" onClick={handleSaveClick}>Save</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
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
            const response = await fetch('/api/py/customer/orders?order_status=All', {
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
                        onClick={() => handleOpenCancelDialog(order_id)}
                    >
                        取消訂單
                    </Button>
                );
            case "Cancelling":
                return (
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        aria-label="cancel order"
                        className="span text-yellow-400"
                    >
                        等待賣家同意取消
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
                        訂單評論
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
    const handleOpenDialog = async (orderid: number) => {
        setActiveOrderId(orderid);
        try {
            const response = await fetch(`/api/py/customer/orders/${orderid}/comment`, {
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
    };
    const handleCloseCancelDialog = () => {
        setOpenCancelDialog(false);
    };
    const handleCancelOrder = async () => {
        if (activeOrderId !== null) {
            const response = await fetch(`/api/py/cancel_orders_pr/customer/${activeOrderId}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                enqueueSnackbar("成功發送取消訂單請求", { variant: 'success' });
                fetchOrders();
                handleCloseCancelDialog();
            } else {
                enqueueSnackbar("發送取消訂單請求失敗", { variant: 'error' });
                console.error('Failed to cancel the order');
            }
        }
    };
    const handleTestShip = async (orderid: number) => {
        const response = await fetch(`/api/py/update_orders_status/customer/${orderid}`, {
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
    const handleCommentSubmit = async () => {
        if (activeOrderId !== null) {
            try {
                const response = await fetch(`/api/py/comment/${activeOrderId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order_id: activeOrderId,
                        stars_input: currentStars,
                        comment_input: currentComment,
                    }),
                });

                if (response.ok) {
                    // Handle successful submission
                    enqueueSnackbar("已送出評論!", { variant: 'success' })
                    setOpenDialog(false);
                } else {
                    // Handle errors
                    enqueueSnackbar("送出評論失敗!", { variant: 'error' })
                    console.error('Failed to submit comment');
                }
            } catch (error) {
                console.error('Error submitting comment', error);
            }
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

                <List component="nav" aria-label="main mailbox folders">
                    <ListItem>
                        <ListItemIcon>
                            <AccountBoxIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的帳號</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('profile')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">個人檔案</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('address')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">我的地址</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={() => setActiveComponent('changePassword')}>
                        <Typography component='span' variant="h6" className="text-neutral-500">更改密碼</Typography>
                    </ListItemButton>
                </List>
                <List component="nav" aria-label="secondary mailbox folders">
                    <ListItem>
                        <ListItemIcon >
                            <ShoppingBasketIcon className="text-3xl" />
                        </ListItemIcon>
                        <Typography component='span' className="font-bold text-[24px]">我的購物</Typography>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItemButton onClick={() => setActiveComponent('orders')}>
                        <Typography component='span' variant="h6" color='secondary'>我的訂單</Typography>
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
                                        <Typography variant="h5" className="font-semibold">{order.sellername}</Typography>
                                        <Typography variant="subtitle1">{"訂單時間 : "+convertToGMTPlus8(order.ordertime)}</Typography>
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
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button onClick={handleCommentSubmit}>Submit</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
                    <DialogTitle>取消訂單請求</DialogTitle>
                    <DialogContent>
                        <Typography variant="h5" className="text-red-500">確定要取消訂單嗎?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCancelDialog}>關閉</Button>
                        <Button onClick={handleCancelOrder}>送出</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
}
export default ReadItAgain;