import { Button, Menu, MenuItem, Typography } from '@mui/material';
import {
  CellChange,
  Column,
  OptionType,
  ReactGrid,
  Row,
} from '@silevis/reactgrid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProjectPointsCell from './ProjectPointsCell';
import { Add, Save } from '@mui/icons-material';
import { HotColumn, HotTable } from '@handsontable/react';
import tableStyles from '@/app/ui/table/table.module.css';
import vtStyles from '@/app/dashboard/voiceteam/voiceteam.module.css';
import './vt-css.css';
import { getLengthBonus } from '@/app/lib/format';
import Handsontable from 'handsontable';

export default function VoiceteamRoundPage({
  round,
  setRound,
  points_cap,
  length_bonus_options,
  bonus_values,
}: {
  round: Round;
  setRound: (round: Round) => void;
  points_cap: number;
  length_bonus_options: object;
  bonus_values: any;
}) {
  const projects = useMemo(
    () =>
      round.challenges
        .flatMap((challenge) => challenge.projects)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [round]
  );
  const [newProject, setNewProject] = useState({
    created_at: new Date(),
  } as Project);
  useEffect(() => console.log({ projects }), [projects]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const addProjectOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const hotRef = useRef(null);

  // questionable but sure ok
  const addProject = (challenge_id: number) => {
    setRound({
      ...round,
      challenges: round.challenges.map((c, i) =>
        c.challenge_id === challenge_id
          ? {
              ...c,
              projects: c.projects.concat([
                {
                  ...newProject,
                  challenge_id,
                  challenge_name: c.name,
                  points_manual: c.points,
                  origIndex: c.projects.length,
                },
              ]),
            }
          : c
      ),
    });
    setNewProject({ created_at: new Date() } as Project);
  };

  useEffect(() => console.log({ projects }), [projects]);

  // the origIndex method is wretched and badly named actually
  const updatePoints = useCallback(
    (projectIndex) => {
      const project = projects[projectIndex];
      const origIndex = project.origIndex;
      const challenge = round.challenges.find(
        (c) => c.challenge_id === project.challenge_id
      );
      const challenge_points = challenge?.points ?? 0;
      const bonusPoints = challenge?.bonus_points ?? 0;
      const universalValue = bonus_values.universal ?? 0;
      const projectLeadValue = bonus_values.project_lead ?? 0;
      console.log({ length_bonus_options });

      console.log({ challenge_points, universalValue, projectLeadValue });

      const origPoints = project.points_manual;
      const lengthBonusFromLength = getLengthBonus(project.length);
      const lengthBonusManual = length_bonus_options[project.length_bonus] ?? 0;
      const lengthBonus = lengthBonusFromLength
        ? lengthBonusFromLength
        : lengthBonusManual;
      console.log({ lengthBonusFromLength, lengthBonusManual, lengthBonus });
      console.log({ bonusManual: project.bonus_manual });

      const newPoints =
        challenge_points +
        (project.universal_bonus ? universalValue : 0) +
        (project.project_lead_bonus ? projectLeadValue : 0) +
        (project.byo_bonus ? 5 : 0) +
        (project.bonus ? bonusPoints : 0) +
        lengthBonus +
        parseInt(project.bonus_manual ?? 0);

      console.log({ newPoints });
      console.log({ origPoints });
      console.log({ origIndex });

      if (newPoints !== origPoints) {
        console.log(`updating points for project ${projectIndex}`);
        console.log(
          `new challenges:`,
          round.challenges.map((c) =>
            c.challenge_id === project.challenge_id
              ? {
                  ...c,
                  projects: c.projects.map((p, i) =>
                    i === origIndex ? { ...p, points_manual: newPoints } : p
                  ),
                }
              : c
          )
        );
        setRound({
          ...round,
          challenges: round.challenges.map((c) =>
            c.challenge_id === project.challenge_id
              ? {
                  ...c,
                  projects: c.projects.map((p, i) =>
                    i === origIndex ? { ...p, points_manual: newPoints } : p
                  ),
                }
              : c
          ),
        });
      }
    },
    [
      projects,
      round,
      bonus_values.universal,
      bonus_values.project_lead,
      length_bonus_options,
      setRound,
    ]
  );

  Handsontable.renderers.registerRenderer(
    'my-text',
    (instance, td, row, col, prop, value, cellProperties) => {
      Handsontable.renderers.TextRenderer(
        instance,
        td,
        row,
        col,
        prop,
        value,
        cellProperties
      );
      const project = projects[row];
      if (!!project && (project.submitted || project.abandoned)) {
        td.style.textDecoration = 'line-through';
        td.style.color = 'gray';
      }
    }
  );

  Handsontable.renderers.registerRenderer(
    'my-dropdown',
    (instance, td, row, col, prop, value, cellProperties) => {
      Handsontable.renderers.DropdownRenderer(
        instance,
        td,
        row,
        col,
        prop,
        value,
        cellProperties
      );
      const project = projects[row];
      if (!!project && (project.submitted || project.abandoned)) {
        td.style.textDecoration = 'line-through';
        td.style.color = 'gray';
      }
    }
  );

  // TODO: figure out a checkbox renderer (might have to do something more involved/specialized for the checkbox?)

  // is it possible to have a number at the bottom of a checkbox row?
  // const bottomRow = useMemo(() => ({  }), [projects])

  // const checkboxRenderer = (instance, td, row, ...rest) => {
  //   if (row === projects.length)
  //     Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
  //   else Handsontable.renderers.CheckboxRenderer(instance, td, row, ...rest);
  // };

  return (
    <div>
      <Typography variant='h4'>Round {round.number}</Typography>
      <br />
      <Button
        variant='contained'
        startIcon={<Add />}
        id='add-project-button'
        aria-controls={addProjectOpen ? 'basic-menu' : undefined}
        aria-haspopup={true}
        aria-expanded={addProjectOpen ? 'true' : undefined}
        onClick={handleClick}
      >
        Add Project
      </Button>
      <Menu
        id='add-project-menu'
        anchorEl={anchorEl}
        open={addProjectOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'add-project-button',
        }}
      >
        {round.challenges?.map((challenge) => (
          <MenuItem
            key={challenge.challenge_id}
            onClick={(e) => {
              e.stopPropagation();
              addProject(challenge.challenge_id);
              handleClose();
            }}
          >
            {challenge.name}
          </MenuItem>
        ))}
      </Menu>
      <Button variant='contained' onClick={() => console.log(projects)}>
        log projects
      </Button>
      <Button variant='contained' onClick={() => console.log(round)}>
        log round
      </Button>

      {/* TODO:
        - strikethrough styling for submitted/abandoned projects
        - summary of projected & real pts - background color green when reached points cap? different green for projected pts?
          - so abandoned not counted for anything, real only counting submitted
        - better project selection, actually link it to challenge id?
        - how best to add rows, etc. do it similarly to other one of adding new at end? or something?
      */}
      <HotTable
        data={[...projects, {}]}
        ref={hotRef}
        licenseKey='non-commercial-and-evaluation'
        // autoWrapCol={true}
        autoWrapCol={false}
        // TODO: figure out how to make this work
        className={tableStyles.arial}
        afterChange={(change, source) => {
          console.log({ change, source });
          // change is of shape [rowIndex, columnName, oldValue, newValue]
          if (!!change) {
            const changeArray = change[0] as Array<any>;
            console.log({ changeArray });
            console.log(changeArray);
            if (
              changeArray[1] === 'universal_bonus' ||
              changeArray[1] === 'project_lead_bonus' ||
              changeArray[1] === 'byo_bonus' ||
              changeArray[1] === 'challenge_id' ||
              changeArray[1] === 'length' ||
              changeArray[1] === 'length_bonus' ||
              changeArray[1] === 'bonus'
            ) {
              console.log('updating points');
              updatePoints(changeArray[0]);
            }
          }
        }}
        colHeaders={[
          'Challenge',
          'Name',
          'Notes',
          'Link',
          'Universal?',
          'Project Lead',
          'BYOB',
          'Length',
          'Length?',
          'Bonus?',
          'Bonus Pts',
          'Fin?',
          'Sub?',
          'Abd?',
          'Projected Pts',
          'Actual Pts',
        ]}
        columns={[
          // TODO: make this actually work
          {
            type: 'dropdown',
            source: round.challenges.map((c) => c.name),
            data: 'challenge_name',
            renderer: 'my-dropdown',
          },
          { data: 'name', renderer: 'my-text' },
          { data: 'notes', width: 400, renderer: 'my-text' },
          {
            data: 'link',
            width: 50,
            autoWrapCol: false,
            afterOnCellCornerDblClick: (event) => {
              console.log({ event });
            },
            allowHtml: true,
            renderer: (instance, td, row, col, prop, value) => {
              td.innerHTML = `<span class="truncated-text"><a href="${value}" target="_blank">${value}</a></span>`;
              const project = projects[row];
              if (!!project && (project.submitted || project.abandoned)) {
                td.style.textDecoration = 'line-through';
                td.style.color = 'gray';
              }
            },
          },
          {
            data: 'universal_bonus',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          {
            data: 'project_lead_bonus',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          {
            data: 'byo_bonus',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          { data: 'length', renderer: 'my-text' },
          {
            data: 'length_bonus',
            type: 'dropdown',
            source: Object.keys(length_bonus_options),
            renderer: 'my-dropdown',
          },
          {
            data: 'bonus',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          { data: 'bonus_manual', renderer: 'my-text' },
          {
            data: 'finished',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          {
            data: 'submitted',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          {
            data: 'abandoned',
            type: 'checkbox',
            renderer: (instance, td, row, ...rest) => {
              if (row === projects.length)
                Handsontable.renderers.TextRenderer(instance, td, row, ...rest);
              else
                Handsontable.renderers.CheckboxRenderer(
                  instance,
                  td,
                  row,
                  ...rest
                );
            },
          },
          {
            data: 'points_manual',
            renderer: (instance, td, row, col, prop, value, cellProperties) => {
              const project = projects[row];
              const isAbandoned = project?.abandoned;
              Handsontable.renderers.TextRenderer(
                instance,
                td,
                row,
                col,
                prop,
                isAbandoned ? 0 : value,
                cellProperties
              );
              if (value >= points_cap) {
                console.log({ value, points_cap });
                td.style.backgroundColor = '#b7e1cd';
              }
            },
          },
          // TODO: how to have it conditionally display?
          {
            data: 'points_manual',
            renderer: (instance, td, row, col, prop, value, cellProperties) => {
              const project = projects[row];
              const isSubmitted = project?.submitted;
              if (row === projects.length) {
                const count = projects
                  ?.filter((p) => p.submitted)
                  ?.reduce((acc, proj) => acc + (proj.points_manual ?? 0), 0);
                Handsontable.renderers.TextRenderer(
                  instance,
                  td,
                  row,
                  col,
                  prop,
                  count,
                  cellProperties
                );
                if (count >= points_cap) {
                  console.log({ count, points_cap });
                  td.style.backgroundColor = '#b7e1cd';
                }
              } else {
                Handsontable.renderers.TextRenderer(
                  instance,
                  td,
                  row,
                  col,
                  prop,
                  isSubmitted ? value : 0,
                  cellProperties
                );
                if (value >= points_cap) {
                  console.log({ value, points_cap });

                  td.style.backgroundColor = '#b7e1cd';
                }
              }
            },
          },
        ]}
        // hmmm just a custom row on the bottom might be best lol i want my own functions
        // these are not lined up. why are they not lined up.
        columnSummary={[
          {
            sourceColumn: 13,
            type: 'custom',
            destinationRow: projects.length,
            destinationColumn: 13,
            customFunction: () => {
              const count =
                projects?.map((p) => p.abandoned)?.filter(Boolean)?.length ?? 0;
              return count;
            },
          },
          {
            sourceColumn: 14,
            type: 'custom',
            destinationRow: projects.length,
            destinationColumn: 14,
            customFunction: () => {
              console.log(projects.filter((p) => !p.abandoned));
              const count = projects
                ?.filter((p) => !p.abandoned)
                ?.reduce((acc, proj) => acc + (proj.points_manual ?? 0), 0);
              return count;
            },
          },
          {
            sourceColumn: 15,
            type: 'custom',
            destinationRow: projects.length,
            destinationColumn: 15,
            customFunction: () => {
              const count = projects
                ?.filter((p) => p.submitted)
                ?.reduce((acc, proj) => acc + (proj.points_manual ?? 0), 0);
              console.log({ count });
              return count;
            },
          },
          // {
          //   sourceColumn: 15,
          //   type: 'custom',
          //   destinationRow: projects.length,
          //   destinationColumn: 15,
          //   customFunction: () => {
          //     const count = projects
          //       ?.filter((p) => p.submitted)
          //       ?.reduce((acc, proj) => acc + (proj.points_manual ?? 0), 0);
          //     console.log({ submittedCount: count });
          //     return count;
          //   },
          // },
        ]}
      />

      <div style={{ paddingBottom: '190px' }} />
    </div>
  );
}
