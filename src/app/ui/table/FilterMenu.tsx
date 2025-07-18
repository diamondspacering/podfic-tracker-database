import { PermissionStatus, PodficStatus } from '@/app/types';
import { ExpandMore, FilterAlt, FilterList, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import styles from './table.module.css';
import DatePicker from '../DatePicker';

// TODO: props type

// options VERY tbd haha
// TODO: expand & clean this up
// TODO: render badges for badged things
export default function FilterMenu({
  type,
  options,
  filter,
  setFilter,
  resetFilter,
  isActivated = false,
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [localFilter, setLocalFilter] = useState(filter);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    console.log('handling close');
    setAnchorEl(null);
    setLocalFilter(filter);
  };

  const [searchValue, setSearchValue] = useState('');
  const filteredOptions = useMemo(
    () =>
      options?.filter((o) =>
        o?.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [options, searchValue]
  );

  // TODO: click away listener or something for closing clicking outside of dialog?
  return (
    <IconButton
      id='filter-menu'
      aria-controls='filter-menu'
      aria-haspopup='true'
      onClick={handleClick}
      sx={{
        padding: '0px',
      }}
    >
      {isActivated ? <FilterAlt /> : <FilterList />}
      <Menu
        id='filter-menu'
        anchorEl={anchorEl}
        open={open}
        onClick={(e) => e.stopPropagation()}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'filter-menu',
          dense: true,
        }}
        disableAutoFocus
        disableRestoreFocus
      >
        <div className={styles.flexColumn}>
          {type === 'date' ? (
            <>
              <Accordion
                defaultExpanded={
                  Object.keys(localFilter).includes('year') ||
                  Object.keys(localFilter).includes('month') ||
                  Object.keys(localFilter).includes('day')
                }
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  Individual
                </AccordionSummary>
                <AccordionDetails>
                  <div className={styles.flexRow}>
                    <TextField
                      size='small'
                      label='Year'
                      value={localFilter?.year}
                      onChange={(e) =>
                        setLocalFilter({
                          ...localFilter,
                          year: e.target.value ? e.target.value : null,
                        })
                      }
                    />
                    <TextField
                      size='small'
                      label='Month'
                      value={localFilter?.month}
                      onChange={(e) =>
                        setLocalFilter({
                          ...localFilter,
                          month: e.target.value ? e.target.value : null,
                        })
                      }
                    />
                    <TextField
                      size='small'
                      label='Day'
                      value={localFilter?.day}
                      onChange={(e) =>
                        setLocalFilter({
                          ...localFilter,
                          day: e.target.value ? e.target.value : null,
                        })
                      }
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
              <Accordion
                defaultExpanded={Object.keys(localFilter).includes('range')}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  Range
                </AccordionSummary>
                <AccordionDetails>
                  <div className={styles.flexRow}>
                    <DatePicker
                      label='Start'
                      value={localFilter?.range?.start}
                      onChange={(val) =>
                        setLocalFilter({
                          range: {
                            ...localFilter?.range,
                            start: val,
                          },
                        })
                      }
                    />
                    <DatePicker
                      label='End'
                      value={localFilter?.range?.end}
                      onChange={(val) =>
                        setLocalFilter({
                          range: {
                            ...localFilter?.range,
                            end: val,
                          },
                        })
                      }
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
            </>
          ) : (
            <>
              {/* TODO: link buttons */}
              <div className={styles.flexRow}>
                <Button
                  size='small'
                  onClick={() => {
                    setLocalFilter(options);
                  }}
                >
                  {`Select all ${options?.length}`}
                </Button>
                <Button
                  size='small'
                  onClick={() => {
                    // resetFilter();
                    setLocalFilter([]);
                  }}
                >
                  Clear
                </Button>
              </div>
              {/* TODO: consider using a mui checkboxes autocomplete - I think I prefer this setup though? */}
              {/* TODO: direct focus to here - should be examples in other dialogs bc he weird */}
              <TextField
                // focused={!!searchValue && true}
                autoFocus
                size='small'
                label='Search'
                slotProps={{
                  input: {
                    endAdornment: <Search />,
                  },
                }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {/* TODO: limit height, etc. */}
              <div className={styles.overflowContainer}>
                <MenuItem key='blanks'>
                  <FormControlLabel
                    label='(blanks)'
                    control={
                      <Checkbox
                        checked={localFilter.includes(null)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setLocalFilter([...localFilter, null]);
                          else
                            setLocalFilter(
                              localFilter.filter((f) => f !== null)
                            );
                        }}
                      />
                    }
                  />
                </MenuItem>
                {filteredOptions.map((option) => (
                  <MenuItem key={option}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={localFilter.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setLocalFilter([...localFilter, option]);
                            else
                              setLocalFilter(
                                localFilter.filter((f) => f !== option)
                              );
                          }}
                        />
                      }
                      label={option}
                    />
                  </MenuItem>
                ))}
              </div>
            </>
          )}
          <div
            className={styles.flexRow}
            style={{
              marginLeft: 'auto',
            }}
          >
            <Button
              // todo this isn't working?
              onClick={() => {
                handleClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={() => {
                // if (filter.every((f) => localFilter.includes(f))) {
                //   resetFilter();
                // } else {
                setFilter(localFilter);
                // }
                handleClose();
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Menu>
    </IconButton>
  );
}
