import React, { useState, useEffect, useRef } from 'react';
import { Grid, Button, TextField, Box, InputAdornment } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientDetails, estimateListSelector } from '../../store/reducers/clientReducer';
import { API_STATUS } from '../../utils/constants';
import clientFormSchema from 'Joi Schemas/clientFormSchema';
import { useTheme } from '@emotion/react';

const ClientForm = () => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.login.username);
  const clientdetails = useSelector(estimateListSelector).submitclients;
  const id = useSelector(estimateListSelector).id;
  const theme = useTheme();
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    email: '',
    createdBy: username
  });
  const [errors, setErrors] = useState({
    clientName: '',
    clientAddress: '',
    email: ''
  });
  const themeMode = useSelector((state) => state.customization.themeMode);
  const [clientId, setClientId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  console.log(clientId);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const submittedParam = urlParams.get('submitted');

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Check for valid input and set errors and isSubmitted
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() === '' ? `Please provide a valid ${name}` : ''
    }));

    setFormData({ ...formData, [name]: value });
    setIsSubmitted(false); // Set isSubmitted to false to show tick icon quickly
  };

  const validateEmailFormat = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Reset isFormSubmitted when the component is mounted
  useEffect(() => {
    setIsSubmitted(false);
  }, []);

  const isNavigationDoneRef = useRef(false); // Using ref to track navigation

  useEffect(() => {
    console.log(clientdetails, 'client details');
    if (submittedParam === 'true' && isSubmitted) {
      // Reset the submittedParam after showing the toast message
      urlParams.set('submitted', 'false');
    }
    if (clientdetails === API_STATUS.FULFILLED && !isNavigationDoneRef.current) {
      console.log(id);
      setClientId(id);
      console.log(clientId);
      navigate(`/utils/generate-estimation/${id}?submitted=true`);
      isNavigationDoneRef.current = true; // Mark navigation as done

      return () => {
        isNavigationDoneRef.current = true;
        console.log(isNavigationDoneRef.current);
        // Clean up function to clear the "submitted" parameter when the component unmounts
        urlParams.delete('submitted');
      };
    }
    if (clientdetails === API_STATUS.REJECTED) {
      toast.error('Client submission failed');
      setIsSubmitted(false);
    }
  }, [clientdetails, id, urlParams, submittedParam, isSubmitted]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData);

    // Check for empty fields and mark them as errors
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      if (formData[field].trim() === '') {
        newErrors[field] = `Please provide a valid ${field}`;
      }
    });
    setErrors(newErrors);

    // Validate email format using regex
    if (formData.email.trim() !== '' && !validateEmailFormat(formData.email)) {
      newErrors.email = 'Please provide a valid Email ID';
    }

    setErrors(newErrors);

    // If there are errors, prevent form submission and show error messages
    if (Object.keys(newErrors).length > 0) {
      setIsSubmitted(false); // Set isSubmitted to false if there are errors
      return;
    }

    // Validate the form with Joi
    const validation = clientFormSchema.validate(formData, { abortEarly: false, allowUnknown: true });
    if (validation.error) {
      validation.error.details.forEach((detail) => {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [detail.context.label]: detail.message
        }));
      });
    } else {
      // setIsFormSubmitted(true);
      setIsSubmitted(true);
      // Dispatch the form submission
      dispatch(clientDetails({ formData }));
      toast.success('Client Details Updated Successfully !', {
        autoClose: 2000
      });
    }
  };

  return (
    <MainCard style={{ height: '100%' }} title="Generate Estimation">
      <Grid style={{ maxWidth: '550px', margin: '30px auto' }} item xs={12} sm={6}>
        <div style={{ height: '100%' }}>
          <Grid style={{ maxWidth: '550px', margin: 'auto' }} item xs={12} sm={6}>
            <SubCard>
              <form style={{color:themeMode === 'dark' ? theme.palette.common.title2 : theme.palette.common.black}} onSubmit={handleSubmit}>
                <FormControl fullWidth>
                  <div>
                    <span style={{ display: 'block', marginBottom: '10px' }}>Client Name</span>
                    <TextField
                      fullWidth
                      type="text"
                      variant="outlined"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      error={!!errors.clientName}
                      helperText={errors.clientName}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {isSubmitted && !errors.clientName && <CheckCircleIcon style={{ color: 'green' }} />}
                            {errors.clientName && <ErrorIcon color="error" />}
                          </InputAdornment>
                        )
                      }}
                      style={{ marginBottom: '10px', borderColor: isSubmitted && !errors.clientName ? 'green' : '' }}
                    />
                  </div>
                  <div>
                    <span style={{ display: 'block', marginBottom: '10px' }}>Client Address</span>
                    <TextField
                      fullWidth
                      type="text"
                      variant="outlined"
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleInputChange}
                      error={!!errors.clientAddress}
                      helperText={errors.clientAddress}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {isSubmitted && !errors.clientAddress && <CheckCircleIcon style={{ color: 'green' }} />}
                            {errors.clientAddress && <ErrorIcon color="error" />}
                          </InputAdornment>
                        )
                      }}
                      style={{ marginBottom: '10px', borderColor: isSubmitted && !errors.clientAddress ? 'green' : '' }}
                    />
                  </div>
                  <div>
                    <span style={{ display: 'block', marginBottom: '10px' }}>Email ID</span>
                    <TextField
                      type="email"
                      fullWidth
                      variant="outlined"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {isSubmitted && !errors.email && <CheckCircleIcon style={{ color: 'green' }} />}
                            {errors.email && <ErrorIcon color="error" />}
                          </InputAdornment>
                        )
                      }}
                      style={{ marginBottom: '10px', borderColor: isSubmitted && !errors.email ? 'green' : '' }}
                    />
                  </div>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      size="large"
                      type="submit"
                      variant="contained"
                      style={{ borderRadius: '20px' }}
                    >
                      Save
                    </Button>
                  </Box>
                </FormControl>
              </form>
            </SubCard>
          </Grid>
        </div>
      </Grid>
    </MainCard>
  );
};

export default ClientForm;
