const MultiSelectDropdown = (params) => {
  let config = {
    search: true,
    placeholder: 'Select...',
    txtSelected: 'Selected',
    txtAll: 'All',
    txtRemove: 'Remove',
    txtSearch: 'Search...',
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
        display:
          config.search === true
            ? 'block'
            : multiSelect.attributes['multiselect-search']?.value === 'true'
            ? 'block'
            : 'none'
      },
      placeholder: config.txtSearch
    });
    dropdownListWrapper.appendChild(search);
    div.appendChild(dropdownListWrapper);
    dropdownListWrapper.appendChild(dropdownList);

    multiSelect.loadOptions = () => {
      dropdownList.innerHTML = '';

      if (multiSelect.attributes['multiselect-select-all']?.value === 'true') {
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
        let optionElement = newElement('div', { class: option.selected ? 'checked' : '', optEl: option });
        let optionCheckbox = newElement('input', { type: 'checkbox', checked: option.selected });
        optionElement.appendChild(optionCheckbox);
        optionElement.appendChild(newElement('label', { text: option.text }));

        optionElement.addEventListener('click', () => {
          optionElement.classList.toggle('checked');
          optionElement.querySelector('input').checked = !optionElement.querySelector('input').checked;
          optionElement.optEl.selected = !optionElement.optEl.selected;
          multiSelect.dispatchEvent(new Event('change'));
        });
        optionCheckbox.addEventListener('click', () => {
          optionCheckbox.checked = !optionCheckbox.checked;
        });
        option.listItemElement = optionElement;
        dropdownList.appendChild(optionElement);
      });
      // Set dropdownListWrapper as a prop on the parent so we can easily call it later
      div.dropdownListWrapper = dropdownListWrapper;

      // Refresh hook called on options updated
      div.refresh = () => {
        let tempSelectedList = document.getElementById('dropdownSelected');
        div.querySelectorAll('span.optext, span.placeholder').forEach((placeholder) => div.removeChild(placeholder));
        let selected = Array.from(multiSelect.selectedOptions);
        if (selected.length > (multiSelect.attributes['multiselect-max-items']?.value ?? 5)) {
          div.appendChild(
            newElement('span', {
              class: ['optext', 'maxselected'],
              text: selected.length + ' ' + config.txtSelected
            })
          );
          selected.map((option) => {
            tempSelectedList
              .querySelectorAll('span')
              .forEach((span, index) => index !== 0 && tempSelectedList.removeChild(span));
            tempSelectedList.appendChild(newElement('span', { text: option.text }));
          });
        } else {
          tempSelectedList
            .querySelectorAll('span')
            .forEach((span, index) => index !== 0 && tempSelectedList.removeChild(span));
          selected.map((option) => {
            let span = newElement('span', {
              class: 'optext',
              text: option.text,
              srcOption: option
            });
            if (multiSelect.attributes['multiselect-hide-x']?.value !== 'true') {
              span.appendChild(
                newElement('span', {
                  class: 'optdel',
                  text: '🗙',
                  title: config.txtRemove,
                  // We need to update the original (hidden) list
                  onclick: (e) => {
                    span.srcOption.listItemElement.dispatchEvent(new Event('click'));
                    div.refresh();
                    e.stopPropagation();
                  }
                })
              );
            }
            div.appendChild(span);
            tempSelectedList.appendChild(newElement('span', { text: option.text }));
          });
        }
        if (multiSelect.selectedOptions.length === 0) {
          div.appendChild(
            newElement('span', {
              class: 'placeholder',
              text: multiSelect.attributes.placeholder?.value ?? config.placeholder
            })
          );
          tempSelectedList.appendChild(newElement('span', { text: 'n/a' }));
        }
      };

      // Call refresh hook on first load
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
};

window.addEventListener('load', () => {
  MultiSelectDropdown(window.MultiSelectDropdownOptions);
});
