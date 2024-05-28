import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';

// material-ui
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography
} from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

//Selector imports
import { logOut,loginSelector } from 'store/reducers/authReducer';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import User1 from 'assets/images/users/avatar_3.jpg';
import GreetingMessage from './GreetingMessage';

// assets
import { IconLogout, IconSettings } from '@tabler/icons';

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Getting values from useSelector
  const username = useSelector(loginSelector).username;
  const user = username.charAt(0).toUpperCase() + username.slice(1);
  const themeMode = useSelector((state) => state.customization.themeMode);
  const roledomain = useSelector((state) => state.login.role);
  const role = roledomain.charAt(0).toUpperCase() + roledomain.slice(1);

  const email = useSelector((state) => state.login.email);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleLogout = async () => {
    dispatch(logOut());
    window.location.href = '/user/login';
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListItemClick = (event, index, route = '') => {
    setSelectedIndex(index);
    handleClose(event);

    if (route && route !== '') {
      navigate(route);
    }
  };
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Chip
        sx={{
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          transition: 'all .2s ease-in-out',
          borderColor: theme.palette.primary.light,
          backgroundColor: themeMode === 'dark' ? theme.palette.darkbg.blue2 :theme.palette.primary.light,
          '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor:themeMode === 'dark' ? 'none' : theme.palette.primary.main,
            background: `${themeMode === 'dark' ? theme.palette.darkbg.blue2 : theme.palette.primary.main}!important`,
            color:themeMode === 'dark' ? theme.palette.background.paper : theme.palette.primary.light,
            '& svg': {
              stroke: themeMode === 'dark' ? theme.palette.background.paper : theme.palette.primary.light
            }
          },
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={User1}
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="1.5rem" color={themeMode === 'dark' ? theme.palette.background.paper:theme.palette.primary.main} />}
        variant="outlined"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions  in={open} {...TransitionProps}>
            <Paper >
              <ClickAwayListener  onClickAway={handleClose}>
                <MainCard style={{ background:themeMode === 'dark' ? theme.palette.darkbg.blue2 : '#fff'}} border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Box sx={{ pt: 2, pl: 2 }}>
                    <Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="h4">
                          <GreetingMessage />
                        </Typography>
                        <Typography color={themeMode === 'dark' ? '#fff' :theme.palette.darkPaper} component="span" variant="h4" sx={{ fontWeight: 400 }}>
                          {user}
                        </Typography>
                      </Stack>
                      <Typography color={themeMode === 'dark' ? theme.palette.grey[500] :theme.palette.darkPaper} my={0.5} style={{ fontSize: '15px' }} variant="subtitle2">
                        {' '}
                        {email}
                      </Typography>
                      <Typography variant="subtitle2" color={themeMode === 'dark' ? '#fff' :theme.palette.dark.dark}>
                        Project {role}
                      </Typography>
                    </Stack>
                  </Box>
                  <PerfectScrollbar style={{height: '100%', maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}>
                    <Box sx={{ p: 2 }}>
                      <Divider />
                      <Divider />
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          backgroundColor: themeMode === 'dark' ? 'transparent' : undefined,
                          borderRadius: '10px',
                          color:'#fff',
                          [theme.breakpoints.down('md')]: {
                            minWidth: '100%'
                          },
                          '& .MuiListItemButton-root': {
                            mt: 0.5
                          }
                        }}
                      >
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 0}
                          onClick={(event) => handleListItemClick(event, 0, '#')}
                        >
                          <ListItemIcon>
                            <IconSettings color={themeMode === 'dark' ? '#fff' : undefined} stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2" color={themeMode === 'dark' ? '#fff' : undefined}>Account Settings</Typography>} />
                        </ListItemButton>
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 1}
                          onClick={(event) => handleListItemClick(event, 1, '/auth/change-password')}
                        >
                          <ListItemIcon>
                            <KeyOutlinedIcon style={{color:themeMode === 'dark' ? '#fff' : undefined}} stroke={1.5} size="1.3rem" />
                          </ListItemIcon>

                          <Grid container spacing={1} justifyContent="space-between">
                            <Grid item>
                              <Typography color={themeMode === 'dark' ? '#fff' : undefined} variant="body2">Change Password</Typography>
                            </Grid>
                          </Grid>
                        </ListItemButton>
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 2}
                          onClick={handleLogout}
                        >
                          <ListItemIcon>
                            <IconLogout stroke={1.5} color={themeMode === 'dark' ? '#fff' : undefined} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography color={themeMode === 'dark' ? '#fff' : undefined} variant="body2">Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </PerfectScrollbar>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;
