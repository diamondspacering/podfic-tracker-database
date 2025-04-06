import styles from '@/app/forms/forms.module.css';
import { createUpdateFandom } from '@/app/lib/updaters';
import { Add, Check } from '@mui/icons-material';
import { Button, CircularProgress, MenuItem, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

export default function FandomForm({ updateCallback }) {
  const [fandomName, setFandomName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const [categories, setCategories] = useState<FandomCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [isNewCategory, setIsNewCategory] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // TODO: use swr instead
  useEffect(() => {
    fetch('/db/fandoms/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setCategoriesLoading(false);
      });
  }, []);

  const submitFandom = useCallback(async () => {
    setSubmitting(true);
    console.log('submitting fandom');

    const newFandom = await createUpdateFandom({
      fandom_name: fandomName,
      category_id: categoryId,
      category_name: categoryName,
    });
    setSubmitting(false);
    updateCallback(newFandom.fandom_id);
  }, [fandomName, categoryId, categoryName, updateCallback]);

  return (
    <div className={`${styles.chapterDiv} ${styles.flexRow}`}>
      <TextField
        size='small'
        label='Fandom Name'
        value={fandomName}
        onChange={(e) => setFandomName(e.target.value)}
      />
      <div className={styles.flexColumn}>
        <TextField
          select
          size='small'
          sx={{
            width: '100px',
          }}
          label='Category'
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((category, i) => (
            <MenuItem key={i} value={category.fandom_category_id}>
              {category.category_name}
            </MenuItem>
          ))}
          {categoriesLoading && (
            <MenuItem disabled value={0}>
              Loading...
            </MenuItem>
          )}
        </TextField>
        {isNewCategory ? (
          <TextField
            size='small'
            label='Category Name'
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        ) : (
          <Button onClick={() => setIsNewCategory(true)} startIcon={<Add />}>
            New Category
          </Button>
        )}
      </div>
      <Button onClick={submitFandom}>
        {submitting ? <CircularProgress /> : <Check />}
      </Button>
    </div>
  );
}
