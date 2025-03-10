(function ($) {
    $(function () {        
        var initNavigationFilter = function (navigationContainerId) {
            var $navigation = $('#' + navigationContainerId);

            var $searchAllDocument = $('#search-all-document');

            var filterDocumentItems = function (filterText) {
                
                $navigation
                    .find('.mCSB_container .opened')
                    .removeClass('opened');
                $navigation
                    .find('.mCSB_container > li, .mCSB_container > li ul')
                    .hide();

                if (!filterText) {
                    $navigation.find('.mCSB_container > li').show();
                    $navigation
                        .find('.mCSB_container .selected-tree > ul')
                        .show();
                    $searchAllDocument.hide();
                    return;
                }

                var filteredItems = $navigation
                    .find('li > a')
                    .filter(function () {
                        return (
                            $(this)
                                .text()
                                .toUpperCase()
                                .indexOf(filterText.toUpperCase()) > -1
                        );
                    });

                filteredItems.each(function () {
                    var $el = $(this);
                    $el.show();
                    var $parent = $el.parent();

                    var hasParent = true;
                    while (hasParent) {
                        if ($parent.attr('id') === navigationContainerId) {
                            break;
                        }

                        $parent.show();
                        $parent
                            .find('> li > label')
                            .not('.last-link')
                            .addClass('opened');

                        $parent = $parent.parent();
                        hasParent = $parent.length > 0;
                    }
                });
                
                $searchAllDocument.show();
            };

            $searchAllDocument.click(function () {
                fullSearch($('#filter').val());
            });

            $('#filter').on('input', (e) => {
                filterDocumentItems(e.target.value);
            })

            $('#filter').keyup(function (e) {
                if (e.key === 'Enter') {
                    fullSearch($('#filter').val());
                }
            });
            
            function fullSearch(filterText){
                var url = $('#fullsearch').data('fullsearch-url');
                if(url){
                    window.open(url + "?keyword=" + encodeURIComponent(filterText));
                }
            }

            $('#fullsearch').keyup(function (e) {
                if (e.key === 'Enter') {
                    fullSearch(e.target.value);
                }
            });
        };  

        var initAnchorTags = function (container) {
            anchors.options = {
                placement: 'left',
            };

            var anchorTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            anchorTags.forEach(function (tag) {
                anchors.add(container + ' ' + tag);
            });
        };

        var initSocialShareLinks = function () {
            var pageHeader = $('.docs-body').find('h1, h2').first().text();

            var projectName = $('#ProjectName')[0].innerText;

            $('#TwitterShareLink').attr(
                'href',
                'https://twitter.com/intent/tweet?text=' +
                encodeURI(
                    pageHeader +
                    ' | ' +
                    projectName +
                    ' | ' +
                    window.location.href
                )
            );

            $('#LinkedinShareLink').attr(
                'href',
                'https://www.linkedin.com/shareArticle?' +
                'url=' +
                encodeURI(window.location.href) +
                '&' +
                'mini=true&' +
                'summary=' +
                encodeURI(projectName) +
                '&' +
                'title=' +
                encodeURI(pageHeader) +
                '&' +
                'source=' +
                encodeURI($('#GoToMainWebSite').attr('href'))
            );

            $('#EmailShareLink').attr(
                'href',
                'mailto:?' +
                'body=' +
                encodeURI('I want you to look at ' + window.location.href) +
                '&' +
                'subject=' +
                encodeURI(pageHeader + ' | ' + projectName) +
                '&'
            );
        };

        var initSections = function () {
            var clearQueryString = function () {
                var uri = window.location.href.toString();

                if (uri.indexOf('?') > 0) {
                    uri = uri.substring(0, uri.indexOf('?'));
                }

                window.history.replaceState({}, document.title, uri);
            };

            var setQueryString = function () {
                var comboboxes = $('.doc-section-combobox');
                if (comboboxes.length < 1) {
                    return;
                }

                var hash = document.location.hash;

                clearQueryString();

                var uri = window.location.href.toString();

                var new_uri = uri + '?';

                for (var i = 0; i < comboboxes.length; i++) {
                    var key = $(comboboxes[i]).data('key');
                    var value = comboboxes[i].value;

                    new_uri += key + '=' + value;

                    if (i !== comboboxes.length - 1) {
                        new_uri += '&';
                    }
                }

                window.history.replaceState({}, document.title, new_uri + hash);
            };

            var getTenYearsLater = function () {
                var tenYearsLater = new Date();
                tenYearsLater.setTime(
                    tenYearsLater.getTime() + 365 * 10 * 24 * 60 * 60 * 1000
                );
                return tenYearsLater;
            };

            var setCookies = function () {
                var cookie = abp.utils.getCookieValue('AbpDocsPreferences');

                if (!cookie || cookie == null || cookie === null) {
                    cookie = '';
                }
                var keyValues = cookie.split('|');

                var comboboxes = $('.doc-section-combobox');

                for (var i = 0; i < comboboxes.length; i++) {
                    var key = $(comboboxes[i]).data('key');
                    var value = comboboxes[i].value;

                    var changed = false;
                    var keyValueslength = keyValues.length;
                    for (var k = 0; k < keyValueslength; k++) {
                        var splitted = keyValues[k].split('=');

                        if (splitted.length > 0 && splitted[0] === key) {
                            keyValues[k] = key + '=' + value;
                            changed = true;
                        }
                    }

                    if (!changed) {
                        keyValues.push(key + '=' + value);
                    }
                }

                abp.utils.setCookieValue(
                    'AbpDocsPreferences',
                    keyValues.join('|'),
                    getTenYearsLater(),
                    '/'
                );
            };

            var initCookies = function () {
                var cookie = abp.utils.getCookieValue('AbpDocsPreferences');

                if (!cookie || cookie == null || cookie === null) {
                    setCookies();
                } else {
                    var uri = window.location.href.toString();

                    if (uri.indexOf('?') > 0) {
                        setCookies();
                    }
                }
            };

            $('.doc-section-combobox').change(function () {
                setCookies();
                clearQueryString();
                location.reload();
            });

            initCookies();
            setQueryString();
        };

        var initDocumentNodeBreadcrumb = function (){
            var selectedTreeRoot = $("li.nav-header.selected-tree")[0];
            if(selectedTreeRoot)
            {
                var $selectedTreeRoot = $(selectedTreeRoot);
                var firstAnchor = $selectedTreeRoot.find("a");

                var documentNodeNames = $("#document-node-wrapper");
                documentNodeNames.append('<li class="breadcrumb-item"><a href="' + firstAnchor.attr("href") + '">' + firstAnchor.html() + '</a></li>');

                var selectedTreeItems = $selectedTreeRoot.find("ul.nav-list > li.selected-tree");
                for (let i = 0; i < selectedTreeItems.length; i++)
                {
                    var anchorItem = $(selectedTreeItems[i]).find("a");
                    documentNodeNames.append('<li class="breadcrumb-item ' + (i === selectedTreeItems.length - 1 ? "active": "") + '"><a href="' + anchorItem.attr("href") + '">' + anchorItem.html() + '</a></li>');
                }
            }
        };
        
        initNavigationFilter('sidebar-scroll');

        initAnchorTags('.docs-page .docs-body');

        initSocialShareLinks();

        initSections();

        initDocumentNodeBreadcrumb();
    });
})(jQuery);
