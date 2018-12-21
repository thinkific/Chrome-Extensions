var videoList = document.getElementById('video-list');

DiskStorage.GetFilesList(function(list) {
  if (!list.length) {
    videoList.innerHTML('<tr><td colspan="2">You have no recordings<td></tr>');
  } else {
    list.forEach(function(item) {
      var tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="load-video">${item.display}</td>
        <td class="fit-width">
          <div class="dropdown-container">
            <div class="dropdown button-group">
              <button class="button button--secondary btn-edit" type="button">
                Edit
              </button>
              <button class="button button--secondary button--icon-only dropdown-toggle" type="button" id="dropdownSplitMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="icon-caret toga-icon toga-icon-ellipsis-v"></span>
                <span class="sr-only">Toggle Dropdown</span>
              </button>
              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownSplitMenuButton">
                <button class="dropdown-menu__item btn-delete">Delete</button>
                <a href="${item.url}" download="${item.name}" class="dropdown-menu__item">Download</a>
              </div>
            </div>
          </div>
        </td>
      `
      videoList.appendChild(tr);

      tr.querySelector('.btn-delete').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to permanently delete the selected recording?')) {
          return;
        }

        DiskStorage.RemoveFile(item.name, function() {
          location.reload();
        });
      };

      tr.querySelector('.btn-edit').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var newFileName = prompt('Please enter new file name', item.display) || item.display;

        DiskStorage.UpdateFileInfo(item.name, {
          display: newFileName
        }, function() {
          location.reload();
        });
      };

      tr.querySelector('.load-video').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        localStorage.setItem('selected-file', item.name);
        window.location.href = `preview.html?video=${item.name}`;
      }
    });
  }
});
