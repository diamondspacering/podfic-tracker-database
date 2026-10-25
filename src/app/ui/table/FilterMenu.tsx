import { ExpandMore, FilterAlt, FilterList, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './table.module.css';
import DatePicker from '../DatePicker';
import { FilterType } from '@/app/types';

// TODO: correctly determine types
interface FilterMenuProps {
  type: string;
  options: any[];
  filter: any;
  setFilter: (filter: any) => void;
  resetFilter: () => void;
  isActivated?: boolean;
}

export default function FilterMenu({
  type,
  options,
  filter,
  setFilter,
  isActivated = false,
}: FilterMenuProps) {
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
      type === FilterType.EVENT
        ? options.filter(
            (o) =>
              o?.event_name
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              o?.parent_name?.toLowerCase().includes(searchValue.toLowerCase()),
          )
        : options?.filter((o) =>
            o?.toLowerCase().includes(searchValue.toLowerCase()),
          ),
    [options, searchValue, type],
  );

  const eventGroups: Record<string, string[]> = useMemo(
    () =>
      type === FilterType.EVENT
        ? filteredOptions.reduce(
            (acc, event) => {
              if (event.parent_name in acc)
                acc[event.parent_name] = [
                  ...acc[event.parent_name],
                  event.event_name,
                ];
              else acc[event.parent_name] = [event.event_name];
              return acc;
            },
            {} as Record<string, string[]>,
          )
        : {},
    [filteredOptions, type],
  );

  const removeFromLocalFilter = useCallback(
    (option: string | string[]) => {
      if (localFilter.includes('ALL'))
        setLocalFilter(
          options.filter((f) =>
            Array.isArray(option) ? !option.includes(f) : f !== option,
          ),
        );
      else
        setLocalFilter(
          localFilter.filter((f) =>
            Array.isArray(option) ? !option.includes(f) : f !== option,
          ),
        );
    },
    [localFilter, options],
  );

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
          {type === FilterType.DATE ? (
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
              <div className={styles.flexRow}>
                <Button
                  size='small'
                  onClick={() => {
                    setLocalFilter(['ALL']);
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
              <div className={styles.overflowContainer}>
                <MenuItem key='blanks'>
                  <FormControlLabel
                    label='(blanks)'
                    control={
                      <Checkbox
                        checked={
                          localFilter.includes('ALL') ||
                          localFilter.includes(null)
                        }
                        onChange={(e) => {
                          if (e.target.checked)
                            setLocalFilter([...localFilter, null]);
                          else removeFromLocalFilter(null);
                        }}
                      />
                    }
                  />
                </MenuItem>
                {type === FilterType.EVENT
                  ? Object.keys(eventGroups).map((eventGroup, i) => (
                      <>
                        <ListSubheader key={i}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size='small'
                                checked={
                                  localFilter.includes('ALL') ||
                                  eventGroups[eventGroup].every((option) =>
                                    localFilter.includes(option),
                                  )
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLocalFilter([
                                      ...localFilter,
                                      ...eventGroups[eventGroup].filter(
                                        (option) =>
                                          !localFilter.includes(option),
                                      ),
                                    ]);
                                  } else {
                                    removeFromLocalFilter(
                                      eventGroups[eventGroup],
                                    );
                                  }
                                }}
                              />
                            }
                            label={eventGroup}
                          />
                        </ListSubheader>
                        {filteredOptions
                          .filter((option) => option.parent_name === eventGroup)
                          .map((option) => (
                            <MenuItem key={option}>
                              <FormControlLabel
                                style={{ marginLeft: '0.5rem' }}
                                control={
                                  <Checkbox
                                    checked={
                                      localFilter.includes('ALL') ||
                                      localFilter.includes(option.event_name)
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked)
                                        setLocalFilter([
                                          ...localFilter,
                                          option.event_name,
                                        ]);
                                      else
                                        removeFromLocalFilter(
                                          option.event_name,
                                        );
                                    }}
                                  />
                                }
                                label={option.event_name}
                              />
                            </MenuItem>
                          ))}
                      </>
                    ))
                  : filteredOptions.map((option) => (
                      <MenuItem key={option}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                localFilter.includes('ALL') ||
                                localFilter.includes(option)
                              }
                              onChange={(e) => {
                                if (e.target.checked)
                                  setLocalFilter([...localFilter, option]);
                                else removeFromLocalFilter(option);
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
