"use client"
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dayjs } from 'dayjs';
import { Avatar, Button, CssBaseline, TextField, FormControlLabel, Checkbox, Link, Paper, Box, Grid, Typography, MenuItem } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="http://localhost:3000/">
        Read it Again
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignInSide() {
  // isRegistering為true時顯示註冊表單，為false時顯示登入表單
  const [isRegistering, setIsRegistering] = React.useState(false);
  // 切換狀態的函數
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <SnackbarProvider anchorOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(/banner.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundPosition: 'center',
        }}
      >
      </Grid>
      {
        isRegistering ?
          <RegisterForm
            toggleForm={toggleForm}
            toggleButton={
              <Button onClick={toggleForm}>
                {isRegistering ? '已經有帳號了？登入' : '沒有帳號？註冊'}
              </Button>
            } /> :
          <LoginForm
            toggleButton={
              <Button onClick={toggleForm}>
                {isRegistering ? '已經有帳號了？登入' : '沒有帳號？註冊'}
              </Button>
            } />
      }
    </Grid>
    </SnackbarProvider>
  );
}
const LoginForm = ({ toggleButton }: { toggleButton: React.ReactElement }) => {
  type LoginValues = {
    memberaccount: string;
    password: string;
  };

  type LoginErrors = {
    memberaccount?: string;
    password?: string;
  };

  const [loginValues, setLoginValues] = React.useState<LoginValues>({ memberaccount: '', password: '' });
  const [loginErrors, setLoginErrors] = React.useState<LoginErrors>({});
  const router = useRouter();
  const validateLogin = (values: LoginValues): LoginErrors => {
    let errors: LoginErrors = {};
    if (!values.memberaccount.trim()) errors.memberaccount = "Account is required";
    if (!values.password.trim()) errors.password = "Password is required";
    return errors;
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 進行驗證
    const errors = validateLogin(loginValues);
    setLoginErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginValues),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Login Successful: ", data);
          enqueueSnackbar("登入成功.", { variant: 'success' });
          router.push('/');
          // 處理成功登入，例如保存token到本地存儲或狀態
        } else if (response.status === 401) {
          const errorData = await response.json();
          console.error("Login Failed: ", errorData.detail);
          // 更新錯誤狀態以顯示錯誤消息
          setLoginErrors({ memberaccount: errorData.detail });
        }
      } catch (error) {
        console.error("Submitting Error: ", error);
      }
    }
  };

  return (
    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
      <Box
        sx={{
          my: 8,
          mx: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="memberaccount"
            label="Account"
            name="Account"
            autoComplete="username"
            autoFocus
            value={loginValues.memberaccount}
            onChange={e => setLoginValues({ ...loginValues, memberaccount: e.target.value })}
            error={!!loginErrors.memberaccount}
            helperText={loginErrors.memberaccount || ''}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={loginValues.password}
            onChange={e => setLoginValues({ ...loginValues, password: e.target.value })}
            error={!!loginErrors.password}
            helperText={loginErrors.password || ''}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              {toggleButton}
            </Grid>
          </Grid>
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Box>
    </Grid>
  );
};
const RegisterForm = ({ toggleForm, toggleButton }: { toggleForm: () => void, toggleButton: React.ReactElement }) => {
  const genders = [
    {
      value: '男性',
      label: '男性',
    },
    {
      value: '女性',
      label: '女性',
    },
    {
      value: '中性',
      label: '中性',
    },
    {
      value: '保密',
      label: '保密',
    },
  ];
  const [formValues, setFormValues] = React.useState<FormValues>({
    firstName: '',
    lastName: '',
    name: '',
    memberaccount: '',
    password: '',
    phone: '',
    birthdate: '',
    gender: '',
    email: ''
  });

  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  type FormValues = {
    firstName: string;
    lastName: string;
    name: string;
    memberaccount: string;
    password: string;
    phone: string;
    birthdate: string;
    gender: string;
    email: string;
  };

  type FormErrors = {
    [key in keyof FormValues]?: string;
  };
  const [Birthday, setBirthDay] = React.useState<Dayjs | null>(null);
  const validate = (values: FormValues): FormErrors => {
    let errors: FormErrors = {};

    if (!values.firstName.trim()) {
      errors.firstName = "First Name is required";
    }
    if (!values.lastName.trim()) {
      errors.lastName = "Last Name is required";
    }
    if (!values.memberaccount.trim()) {
      errors.memberaccount = "Account is required";
    }
    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    if (!values.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(values.phone)) {
      errors.phone = "Invalid phone number, must be 10 digits";
    }
    if (!values.birthdate.trim()) {
      errors.birthdate = "Birthday is required";
    }
    if (!values.gender.trim()) {
      errors.gender = "Gender is required";
    }
    if (!values.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }

    return errors;
  };
  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedBirthday = Birthday ? Birthday.format('YYYY-MM-DD') : '';
    const fullName = `${formValues.firstName}${formValues.lastName}`;
    const updatedFormValues = {
      ...formValues,
      name: fullName,
      birthdate: formattedBirthday,
    };
    // 進行驗證
    const validationErrors = validate(updatedFormValues);
    setFormErrors(validationErrors);
    // 如果沒有錯誤，處理表單提交邏輯
    if (Object.keys(validationErrors).length === 0) {
      try {
        // 假設你有一個API端點可以接收這個表單的數據
        const response = await fetch('/api/py/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFormValues),
        });

        if (!response.ok) {
          enqueueSnackbar("註冊失敗.", { variant: 'error' });
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Form Submitted Successfully", result);
        enqueueSnackbar("註冊成功.", { variant: 'success' });
        toggleForm();
      } catch (error) {
        console.error("Submitting Error: ", error);
        // 處理提交過程中的錯誤，如顯示錯誤消息
      }
    } else {
      enqueueSnackbar("有欄位發生錯誤.", { variant: 'error' });
      console.error("Validation Errors: ", validationErrors);
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" onSubmit={handleSignupSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name 姓"
                  value={formValues.firstName}
                  onChange={e => setFormValues({ ...formValues, firstName: e.target.value })}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name 名字"
                  name="lastName"
                  autoComplete="family-name"
                  value={formValues.lastName}
                  onChange={e => setFormValues({ ...formValues, lastName: e.target.value })}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="username"
                  name="Account"
                  required
                  fullWidth
                  id="Account"
                  label="Account 帳號"
                  value={formValues.memberaccount}
                  onChange={e => setFormValues({ ...formValues, memberaccount: e.target.value })}
                  error={!!formErrors.memberaccount}
                  helperText={formErrors.memberaccount || ''}
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password 密碼"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formValues.password}
                  onChange={e => setFormValues({ ...formValues, password: e.target.value })}
                  error={!!formErrors.password}
                  helperText={formErrors.password || ''}
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="phone"
                  label="Phone 手機號碼"
                  type="phone"
                  id="phone"
                  autoComplete="tel"
                  value={formValues.phone}
                  onChange={e => setFormValues({ ...formValues, phone: e.target.value })}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone || ''}
                />
              </Grid>
              <Grid item xs={8} sm={8}>
                <DateField
                  label="Birthday 出生日期"
                  format="YYYY-MM-DD"
                  fullWidth
                  required
                  value={Birthday}
                  onChange={(newValue) => setBirthDay(newValue)}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <TextField
                  id="select-gender"
                  fullWidth
                  select
                  required
                  label="Gender 性別"
                  defaultValue={"保密"}
                  value={formValues.gender}
                  onChange={e => setFormValues({ ...formValues, gender: e.target.value })}
                  error={!!formErrors.gender}
                  helperText={formErrors.gender || ''}
                >
                  {genders.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formValues.email}
                  onChange={e => setFormValues({ ...formValues, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email || ''}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                {toggleButton}
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Grid>
    </LocalizationProvider>
  );
};