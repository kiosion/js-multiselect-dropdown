const MultiSelectDropdown = (params) => {
  let config = {
    search: true,
    hideX: false,
    useStyles: true,
    placeholder: 'Select...',
    txtSelected: 'Selected',
    txtAll: 'All',
    txtRemove: 'Remove',
    txtSearch: 'Search...',
    minWidth: '160px',
    maxWidth: '360px',
    maxHeight: '180px',
    borderRadius: 6,
    ...params
  };

  const newElement = (tag, params) => {
    let element = document.createElement(tag);
    if (params) {
      Object.keys(params).forEach((key) => {
        if (key === 'class') {
          Array.isArray(params[key])
            ? params[key].forEach((o) => (o !== '' ? element.classList.add(o) : 0))
            : params[key] !== ''
            ? element.classList.add(params[key])
            : 0;
        } else if (key === 'style') {
          Object.keys(params[key]).forEach((value) => {
            element.style[value] = params[key][value];
          });
        } else if (key === 'text') {
          params[key] === '' ? (element.innerHTML = '&nbsp;') : (element.innerText = params[key]);
        } else {
          element[key] = params[key];
        }
      });
    }
    return element;
  };

  document.querySelectorAll('select[multiple]').forEach((multiSelect) => {
    let div = newElement('div', { class: 'multiselect-dropdown' });
    multiSelect.style.display = 'none';
    multiSelect.parentNode.insertBefore(div, multiSelect.nextSibling);
    let dropdownListWrapper = newElement('div', { class: 'multiselect-dropdown-list-wrapper' });
    let dropdownList = newElement('div', { class: 'multiselect-dropdown-list' });
    let search = newElement('input', {
      class: ['multiselect-dropdown-search'].concat([config.searchInput?.class ?? 'form-control']),
      style: {
        width: '100%',
        display: config.search ? 'block' : multiSelect.attributes.search?.value === 'true' ? 'block' : 'none'
      },
      placeholder: config.txtSearch
    });
    dropdownListWrapper.appendChild(search);
    div.appendChild(dropdownListWrapper);
    dropdownListWrapper.appendChild(dropdownList);

    multiSelect.loadOptions = () => {
      dropdownList.innerHTML = '';

      if (config.selectAll || multiSelect.attributes['select-all']?.value === 'true') {
        let optionElementAll = newElement('div', { class: 'multiselect-dropdown-all-selector' });
        let optionCheckbox = newElement('input', { type: 'checkbox' });
        optionElementAll.appendChild(optionCheckbox);
        optionElementAll.appendChild(newElement('label', { text: config.txtAll }));

        optionElementAll.addEventListener('click', () => {
          optionElementAll.classList.toggle('checked');
          optionElementAll.querySelector('input').checked = !optionElementAll.querySelector('input').checked;

          let ch = optionElementAll.querySelector('input').checked;
          dropdownList.querySelectorAll(':scope > div:not(.multiselect-dropdown-all-selector)').forEach((i) => {
            if (i.style.display !== 'none') {
              i.querySelector('input').checked = ch;
              i.optEl.selected = ch;
            }
          });

          multiSelect.dispatchEvent(new Event('change'));
        });
        optionCheckbox.addEventListener('click', () => {
          optionCheckbox.checked = !optionCheckbox.checked;
        });

        dropdownList.appendChild(optionElementAll);
      }

      Array.from(multiSelect.options).map((option) => {
        let optionElement = newElement('div', { class: option.selected ? 'checked' : '', srcElement: option });
        let optionCheckbox = newElement('input', { type: 'checkbox', checked: option.selected });
        optionElement.appendChild(optionCheckbox);
        optionElement.appendChild(newElement('label', { text: option.text }));

        optionElement.addEventListener('click', () => {
          optionElement.classList.toggle('checked');
          optionElement.querySelector('input').checked = !optionElement.querySelector('input').checked;
          optionElement.srcElement.selected = !optionElement.srcElement.selected;
          multiSelect.dispatchEvent(new Event('change'));
        });
        optionCheckbox.addEventListener('click', () => {
          optionCheckbox.checked = !optionCheckbox.checked;
        });
        option.optionElement = optionElement;
        dropdownList.appendChild(optionElement);
      });
      div.dropdownListWrapper = dropdownListWrapper;

      div.refresh = () => {
        // For demo purposes, remove
        let tempSelectedList = document.getElementById('dropdownSelected');

        div.querySelectorAll('span.optext, span.placeholder').forEach((placeholder) => div.removeChild(placeholder));
        let selected = Array.from(multiSelect.selectedOptions);
        if (selected.length > (multiSelect.attributes['max-items']?.value ?? 5)) {
          div.appendChild(
            newElement('span', {
              class: ['optext', 'maxselected'],
              text: selected.length + ' ' + config.txtSelected
            })
          );
          // For demo purposes, remove
          tempSelectedList
            .querySelectorAll('span')
            .forEach((span, index) => index !== 0 && tempSelectedList.removeChild(span));
          selected.map((option) => tempSelectedList.appendChild(newElement('span', { text: option.text })));
        } else {
          // For demo purposes, remove
          tempSelectedList
            .querySelectorAll('span')
            .forEach((span, index) => index !== 0 && tempSelectedList.removeChild(span));

          selected.map((option) => {
            let span = newElement('span', {
              class: 'optext',
              text: option.text,
              srcElement: option
            });
            if (!config.hideX) {
              span.appendChild(
                newElement('span', {
                  class: 'optdel',
                  text: '🗙',
                  title: config.txtRemove,
                  onclick: (e) => {
                    span.srcElement.optionElement.dispatchEvent(new Event('click'));
                    div.refresh();
                    e.stopPropagation();
                  }
                })
              );
            }
            div.appendChild(span);
            // For demo purposes, remove
            tempSelectedList.appendChild(newElement('span', { text: option.text }));
          });
        }
        if (multiSelect.selectedOptions?.length === 0) {
          div.appendChild(
            newElement('span', {
              class: 'placeholder',
              text: multiSelect.attributes?.placeholder?.value ?? config.placeholder
            })
          );
          // For demo purposes, remove
          tempSelectedList.appendChild(newElement('span', { text: 'n/a' }));
        }
      };
      div.refresh();
    };
    multiSelect.loadOptions();

    search.addEventListener('input', () => {
      dropdownList.querySelectorAll(':scope div:not(.multiselect-dropdown-all-selector)').forEach((div) => {
        let innerText = div.querySelector('label').innerText.toLowerCase();
        div.style.display = innerText.includes(search.value.toLowerCase()) ? 'flex' : 'none';
      });
    });

    div.addEventListener('click', () => {
      div.dropdownListWrapper.style.display = 'block';
      search.focus();
      search.select();
    });

    document.addEventListener('click', (e) => {
      if (!div.contains(e.target)) {
        dropdownListWrapper.style.display = 'none';
        div.refresh();
      }
    });
  });

  const createStyles = () => {
    let styles = {
      ':root': {
        '--color-background': '#ffffff',
        '--color-border': '#ced4da',
        '--color-background--option': '#d6dde6',
        '--color-background--option--hover': '#cbd5e0a1',
        '--color-text--normal': '#0c0c0c',
        '--color-text--grey': '#24262c',
        '--color-text--red': '#cc6666',
        '--color-text--placeholder': '#ced4da',
        '--border-radius--base': `${parseInt(config.borderRadius)}px` || '6px',
        '--border-radius--small': `${parseInt(config.borderRadius) * 0.75}px` || '4px'
      },
      '.multiselect-dropdown': {
        position: 'relative',
        display: 'inline-flex',
        'flex-wrap': 'wrap',
        padding: '6px 36px 6px 6px',
        gap: '6px',
        'border-radius': 'var(--border-radius--base)',
        border: 'solid 1px var(--color-border)',
        background: 'var(--color-background)',
        'background-image':
          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\")",
        'background-repeat': 'no-repeat',
        'background-position': 'right 6px center',
        'background-size': '16px 12px',
        'min-width': `${config.minWidth}` ?? '140px',
        'max-width': `${config.maxWidth}` ?? '360px',
        cursor: 'pointer'
      },
      'span.optext, span.placeholder': {
        display: 'inline-flex',
        'justify-content': 'center',
        'align-items': 'center',
        'font-size': '16px',
        'border-radius': 'var(--border-radius--small)'
      },
      'span.optext': {
        'background-color': 'var(--color-background--option)',
        padding: '0 12px 2px 6px',
        cursor: 'default',
        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none'
      },
      'span.optext .optdel': {
        float: 'right',
        margin: '0 -6px 1px 6px',
        'font-size': '12px',
        cursor: 'pointer',
        color: 'var(--color-text--grey)'
      },
      'span.optext .optdel:hover': {
        color: 'var(--color-text--red)'
      },
      'span.placeholder': {
        color: 'var(--color-border)'
      },
      '.multiselect-dropdown-list-wrapper': {
        'z-index': 100,
        'border-radius': 'var(--border-radius--base)',
        border: 'solid 1px var(--color-border)',
        display: 'none',
        margin: '-1px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'var(--color-background)'
      },
      '.multiselect-dropdown-search': {
        padding: '5px 6px 6px 5px',
        'border-top-left-radius': 'var(--border-radius--base)',
        'border-top-right-radius': 'var(--border-radius--base)',
        border: 'solid 1px transparent',
        'border-bottom': 'solid 1px var(--color-border)',
        'font-size': 'inherit'
      },
      '.multiselect-dropdown-search::placeholder': {
        color: 'var(--color-text--placeholder)',
        'font-size': '16px'
      },
      '.multiselect-dropdown-search:focus, .multiselect-dropdown-search:focus-visible': {
        outline: 'none'
      },
      '.multiselect-dropdown-list': {
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
        height: '100%',
        'max-height': `${config.maxHeight}` ?? '160px'
      },
      '.multiselect-dropdown-list::-webkit-scrollbar': {
        width: '4px'
      },
      '.multiselect-dropdown-list::-webkit-scrollbar-thumb': {
        'background-color': 'var(--color-background--option)',
        'border-radius': '1000px'
      },
      '.multiselect-dropdown-list div, .multiselect-dropdown-list div > input, .multiselect-dropdown-list div > label':
        {
          cursor: 'pointer',
          'border-radius': 'var(--border-radius--base)'
        },
      '.multiselect-dropdown-list div': {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'flex-start',
        'column-gap': '6px',
        padding: '6px',
        margin: '6px 8px 6px 6px',
        transition: '100ms cubic-bezier(0.455, 0.03, 0.515, 0.955)'
      },
      '.multiselect-dropdown-list div:hover': {
        'background-color': 'var(--color-background--option--hover)'
      },
      '.multiselect-dropdown-list-input': {
        height: '14px',
        width: '14px',
        border: 'solid 1px var(--color-text--grey)',
        margin: 0
      },
      '.multiselect-dropdown span.maxselected': {
        width: '100%'
      },
      '.multiselect-dropdown-all-selector': {
        'border-bottom': 'solid 1px var(--color-border)'
      }
    };
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = `${Object.keys(styles)
      .map(
        (selector) =>
          `${selector} { ${Object.keys(styles[selector])
            .map((property) => `${property}: ${styles[selector][property]}`)
            .join('; ')} }`
      )
      .join('\n')}`;
    document.head.appendChild(style);
  };

  config.useStyles && createStyles();
};

window.addEventListener('load', () => {
  MultiSelectDropdown(window.MultiSelectDropdownOptions);
});
