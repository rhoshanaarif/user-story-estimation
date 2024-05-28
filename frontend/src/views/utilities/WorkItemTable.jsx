import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplexity, complexitySelector } from '../../store/reducers/complexityReducer';
import { API_STATUS } from '../../utils/constants';
import { componentSelector, fetchComponents } from '../../store/reducers/componentReducer';
import { submitWorkItem, workItemSelector } from '../../store/reducers/workitemReducer';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Paper,
  Select,
  MenuItem,
  TextField,
  TextareaAutosize,
  Tooltip,
  Box
} from '@mui/material';
import { useTheme } from '@emotion/react';

const WorkItem = () => {
  const { id } = useParams();
  console.log(id);
  const [rows, setRows] = useState([{}]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showEstimateSummary, setShowEstimateSummary] = useState(false);
  const [componentTypes, setComponentTypes] = useState([]);
  const [complexities, setComplexities] = useState([]);
  const [defaultComponent, setDefaultComponent] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.customization.themeMode);
  const complexityloading = useSelector(complexitySelector).complexityloading;
  const componentloading = useSelector(componentSelector).componentloading;
  const workitemloading = useSelector(workItemSelector).workitemloading;
  const data = useSelector(complexitySelector).loadData;
  const componentData = useSelector(componentSelector).loadData;
  console.log(defaultComponent);

  useEffect(() => {
    dispatch(fetchComponents());
    dispatch(fetchComplexity());
  }, [dispatch]);

  useEffect(() => {
    console.log(componentloading, 'loading');
    if (componentloading === API_STATUS.FULFILLED) {
      console.log('Component data got Successfully!');
      setComponentTypes(componentData);
      const componentDefaultData = componentData.find((component) => component.default === 'default');

      if (componentDefaultData && componentDefaultData.name) {
        setDefaultComponent(componentDefaultData.name);
        console.log(defaultComponent);
        console.log(componentTypes);
      }
    }
    if (componentloading === API_STATUS.REJECTED) {
      console.log('Component data got failed');
      toast.error('Workitem Component data got failed !', {
        autoClose: 2000
      });
    }

    console.log(complexityloading, 'loading');
    if (complexityloading === API_STATUS.FULFILLED) {
      console.log('Complexity data got Successfully!');
      setComplexities(data);
      console.log(complexities);
    }
    if (complexityloading === API_STATUS.REJECTED) {
      toast.error('Workitem data got failed !', {
        autoClose: 2000
      });
    }

    console.log(workitemloading, 'loading');
    if (workitemloading === API_STATUS.FULFILLED) {
      console.log('workitem data submitted got Successfully!');

      setRows([]);
      navigate(`/utils/estimate-summary/${id}`);
      setShowEstimateSummary(true);
    }
    if (workitemloading === API_STATUS.REJECTED) {
      console.log('Data got failed');
      toast.error('Workitem data got failed !', {
        autoClose: 2000
      });
    }
  }, [componentloading, complexityloading, workitemloading]);

  const selectedComplexity = complexities.length > 0 ? complexities[0].complexity : '';
  const selectedBuildEffort = selectedComplexity ? complexities[0].days : '0';

  const addRow = () => {
    setRows([...rows, {}]);
  };
  useEffect(() => console.log(selectedBuildEffort));

  const deleteRow = () => {
    setRows((prevRows) => {
      if (prevRows.length > 1) {
        return prevRows.slice(0, prevRows.length - 1);
      }
      return prevRows;
    });
  };

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index][name] = value;

      if (name === 'complexity') {
        const selectedComplexity = value;

        const selectedBuildEffort =
          selectedComplexity === 'Simple' ? '1' : selectedComplexity === 'Medium' ? '2' : selectedComplexity === 'Complex' ? '3' : '';

        updatedRows[index]['buildEffort'] = selectedBuildEffort;
      }

      return updatedRows;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let allRowsValid = true;
    let isFormValid = true;
    const unfilledFields = [];
    for (const row of rows) {
      const finalEffort = row.effortOverride || row.buildEffort || selectedBuildEffort;

      const workItem = {
        module: row.module || '',
        userType: row.userType || '',
        appType: row.appType || '',
        componentName: row.componentName || '',
        comments: row.comments || 'must',
        description: row.description || '',
        componentType: row.componentType || defaultComponent,
        complexity: selectedComplexity || row.complexity,
        buildEffort: row.buildEffort || selectedBuildEffort,
        effortOverride: row.effortOverride || '0',
        finalEffort: finalEffort, // Use the calculated finalEffort
        clientId: id
      };
      console.log(workItem);
      console.log(finalEffort);

      // Check if any of the required fields are empty
      const requiredFields = [
        'module',
        'userType',
        'appType',
        'componentName',
        'comments',
        'description',
        'componentType',
        'complexity',
        'buildEffort'
      ];

      for (const field of requiredFields) {
        if (!workItem[field]) {
          isFormValid = false;
          allRowsValid = false; 
          
          unfilledFields.push(field); 
          
        }
      }

      if (isFormValid) {
        dispatch(submitWorkItem({ workItem }));
        
      } else {
        setTooltipOpen(true); 
      }
    }
    
    if (allRowsValid) {
      toast.success('All work items submitted successfully !', {
        autoClose: 2000
      });
    } else {
      setTooltipOpen(true); 
      toast.error('Some fields are required. Please fill them in.');
    }
    
  };
  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        finalEffort: row.effortOverride || selectedBuildEffort
      }))
    );
  }, [selectedBuildEffort]);

  const renderTableHeader = () => {
    const headers = [
      'S.No',
      'Module',
      'User Type',
      'App Type',
      'Component Name',
      'Comments',
      'Description',
      'Component Type',
      'Complexity',
      'Build Effort (in days)',
      'Effort Override (in days)',
      'Final Effort (in days)',
      'Action'
    ];

    return headers.map((header, index) => (
      <TableCell className="workitem-data" key={index}>
        {header}
      </TableCell>
    ));
  };

  const renderTableBody = () => {
    return rows.map((row, index) => {
      const effortOverride = parseFloat(row.effortOverride) || 0;
      const finalEffort = effortOverride ? effortOverride : row.buildEffort || selectedBuildEffort;
      const showDeleteButton = index !== 0; // Show delete button for all rows except the first row

      return (
        <TableRow className="table-rows" key={index}>
          <TableCell
            style={{ color: themeMode === 'dark' ? theme.palette.background.paper : theme.palette.common.black }}
            className="workitem-data"
          >
            {index + 1}
          </TableCell>

          <TableCell className="workitem-data">
            <Tooltip
              open={tooltipOpen && !row.module}
              title="Module is required"
              arrow
              placement="top"
              PopperProps={{
                style: { transform: 'translateX(10px)', zIndex: '0' }
              }}
            >
              <TextField
                fullWidth
                style={{ minWidth: '145px' }}
                type="text"
                name="module"
                value={row.module}
                onChange={(e) => handleChange(e, index)}
                required
              />
            </Tooltip>
          </TableCell>
          <TableCell className="workitem-data">
            <Tooltip
              open={tooltipOpen && !row.userType}
              title="UserType is required"
              arrow
              placement="top"
              PopperProps={{
                style: { transform: 'translateX(10px)', zIndex: '0' }
              }}
            >
              <TextField
                fullWidth
                style={{ minWidth: '125px' }}
                type="text"
                name="userType"
                value={row.userType}
                onChange={(e) => handleChange(e, index)}
                required
              />
            </Tooltip>
          </TableCell>
          <TableCell className="workitem-data">
            <Tooltip
              open={tooltipOpen && !row.appType}
              title="AppType is required"
              arrow
              placement="top"
              PopperProps={{
                style: { transform: 'translateX(10px)', zIndex: '0' }
              }}
            >
              <TextField
                fullWidth
                style={{ minWidth: '125px' }}
                type="text"
                name="appType"
                value={row.appType}
                onChange={(e) => handleChange(e, index)}
                required
              />
            </Tooltip>
          </TableCell>
          <TableCell className="workitem-data">
            <Tooltip
              open={tooltipOpen && !row.componentName}
              title="Component is required"
              arrow
              placement="top"
              PopperProps={{
                style: { transform: 'translateX(10px)', zIndex: '0' }
              }}
            >
              <TextField
                fullWidth
                type="text"
                style={{ minWidth: '140px' }}
                name="componentName"
                value={row.componentName}
                onChange={(e) => handleChange(e, index)}
                required
              />
            </Tooltip>
          </TableCell>
          <TableCell className="workitem-data">
            <Select
              name="comments"
              style={{ minWidth: '120px' }}
              value={row.comments || 'must'}
              onChange={(e) => handleChange(e, index)}
              required
              fullWidth
            >
              <MenuItem value="must">Must to have</MenuItem>
              <MenuItem value="good">Good to have</MenuItem>
              <MenuItem value="nice">Nice to have</MenuItem>
            </Select>
          </TableCell>
          <TableCell className="workitem-data">
            <Tooltip
            
              open={tooltipOpen && !row.description}
              title="Desription is required"
              arrow
              placement="top"
              PopperProps={{
                style: { transform: 'translateX(10px)', zIndex: '0' }
              }}
            >
              <TextareaAutosize
                value={row.description}
                onChange={(e) => handleChange(e, index)}
                name="description"
                required
                placeholder="Enter description"
                sx={{}}
                style={{
                  color:themeMode === 'dark' ? theme.palette.background.paper:theme.palette.common.black,
                  background:themeMode === 'dark' ? theme.palette.darkbg.blue2 :theme.palette.background.paper,
                  width: '100%',
                  minWidth: '175px',
                  resize: 'none',
                  height: '61px',
                  overflow: 'visible',
                  padding: '8px',
                  border: themeMode === 'dark' ? 'none' : '1px solid darkgrey',
                  borderRadius: '10px'
                }}
              />
            </Tooltip>
          </TableCell>
          <TableCell className="workitem-data">
            <Select
              name="componentType"
              style={{ minWidth: '120px' }}
              value={row.componentType || defaultComponent}
              onChange={(e) => handleChange(e, index)}
              required
              fullWidth
            >
              {defaultComponent && <MenuItem value={defaultComponent}>{defaultComponent}</MenuItem>}
              {componentTypes
                .filter((type) => type.name !== defaultComponent)
                .map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
            </Select>
          </TableCell>
          <TableCell className="workitem-data">
            <Select
              name="complexity"
              style={{ minWidth: '100px' }}
              value={row.complexity || selectedComplexity}
              onChange={(e) => handleChange(e, index)}
              required
              fullWidth
            >
              {complexities.map((complexity) => (
                <MenuItem key={complexity.id} value={complexity.complexity === row.complexity ? complexity.complexity : selectedComplexity}>
                  {complexity.complexity === row.complexity ? complexity.complexity : selectedComplexity}
                </MenuItem>
              ))}
              {selectedComplexity !== 'Simple' && <MenuItem value="Simple">Simple</MenuItem>}
              {selectedComplexity !== 'Medium' && <MenuItem value="Medium">Medium</MenuItem>}
              {selectedComplexity !== 'Complex' && <MenuItem value="Complex">Complex</MenuItem>}
            </Select>
          </TableCell>
          <TableCell className="workitem-data">
            <TextField
              style={{ minWidth: '90px' }}
              fullWidth
              type="text"
              className="col-9"
              name="buildEffort"
              value={row.buildEffort || selectedBuildEffort}
              readOnly
            />
          </TableCell>
          <TableCell className="workitem-data">
            <TextField
              fullWidth
              style={{ minWidth: '100px' }}
              type="number"
              name="effortOverride"
              value={row.effortOverride || ''}
              onChange={(e) => handleChange(e, index)}
            />
          </TableCell>
          <TableCell
            style={{ color: themeMode === 'dark' ? theme.palette.background.paper : theme.palette.common.black }}
            className="workitem-data"
          >
            <div style={{ minWidth: '80px' }}>{finalEffort}</div>
          </TableCell>
          <TableCell className="workitem-data">
            {showDeleteButton ? (
              <Button className="delete-row-button" onClick={deleteRow}>
                <DeleteIcon />
              </Button>
            ) : (
              <Button className="disable-delete ">
                <DeleteIcon />{' '}
              </Button>
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div>
      {!showEstimateSummary && (
        <MainCard style={{ height: '100%' }} title="Workitem Table">
          <TableContainer
            style={{
              backgroundColor: themeMode === 'dark' ? theme.palette.darkbg.blue1 : theme.palette.background.paper
            }}
            className="work-item-container"
            component={Paper}
          >
            <Table>
              <TableHead style={{ backgroundColor: themeMode === 'dark' ? theme.palette.common.subtitle : theme.palette.common.light2 }}>
                <TableRow>{renderTableHeader()} </TableRow>
              </TableHead>
              <TableBody className="table-body-container">{renderTableBody()}</TableBody>
            </Table>
          </TableContainer>
          <Box display="flex">
            <Button variant="contained" onClick={addRow} className="primary-btn" style={{ margin: '20px 12px 0px 0px' }}>
              Add Row
            </Button>
            <Button variant="contained" onClick={handleSubmit} className="primary-btn" style={{ margin: '20px 0px 0px 0px' }}>
              Submit
            </Button>
          </Box>
        </MainCard>
      )}
    </div>
  );
};

export default WorkItem;
